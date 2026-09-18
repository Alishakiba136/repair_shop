#!/usr/bin/env python3
"""
Kleinanzeigen.de Defective Listings Scraper (Dortmund)
=====================================================
A clean, production-ready async web scraper built with Playwright to extract
defective / for-parts ("defekt", "für Bastler") item listings in Dortmund.

Features:
- Async Playwright browser automation
- Anti-bot detection headers and randomized timing jitter
- GDPR cookie banner handling
- Duplicate prevention using a local seen-ID database (JSON)
- Dual logging to stdout and 'scraper_execution.log'
- Export results to structured JSON and CSV
"""

import argparse
import asyncio
import json
import logging
import os
import random
import sys
from datetime import datetime
from typing import Dict, List, Set, Any, Optional
from urllib.parse import quote_plus

from dotenv import load_dotenv
from playwright.async_api import async_playwright, BrowserContext, Page, TimeoutError as PlaywrightTimeoutError
from local_llm_analyzer import LocalLLMAnalyzer
from telegram_notify import send_telegram_message

load_dotenv()

# ==========================================
# 1. Configuration & Constants
# ==========================================

# Base URL for Kleinanzeigen (formerly eBay Kleinanzeigen)
BASE_URL = "https://www.kleinanzeigen.de"

# Target search terms for broken/repairable equipment
DEFAULT_KEYWORDS = ["defekt", "für Bastler"]

# Dortmund location identifier on Kleinanzeigen:
# Location slug: 'dortmund', Location ID: 'l2078' (Standard Kleinanzeigen location ID for Dortmund)
DEFAULT_LOCATION_NAME = "Dortmund"
LOCATION_ID = "2078"

# Output and state files
LOG_FILE_PATH = "scraper_execution.log"
SEEN_IDS_FILE = "seen_listings.json"
OUTPUT_JSON_FILE = "extracted_defective_listings.json"

# Operational limits
MAX_PAGES_PER_KEYWORD = 2  # Number of search result pages to scan per keyword
PAGE_LOAD_TIMEOUT_MS = 30000  # 30 seconds max page wait time

# ==========================================
# 2. Logging Setup
# ==========================================

def setup_logger() -> logging.Logger:
    """
    Configures standard Python logging to stream formatted logs to both:
    1. Standard Console (stdout) for real-time operator monitoring.
    2. 'scraper_execution.log' for persistent audit trails and debugging.
    
    Why: Production scrapers require traceable timestamps, log levels, and line
    references to quickly diagnose anti-bot blocks or structural selector changes.
    """
    logger = logging.getLogger("KleinanzeigenScraper")
    logger.setLevel(logging.INFO)

    # Avoid duplicate handlers if setup_logger is invoked multiple times
    if logger.hasHandlers():
        logger.handlers.clear()

    log_format = logging.Formatter(
        fmt="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(log_format)
    logger.addHandler(console_handler)

    # File Handler (append mode)
    file_handler = logging.FileHandler(LOG_FILE_PATH, mode="a", encoding="utf-8")
    file_handler.setFormatter(log_format)
    logger.addHandler(file_handler)

    return logger

logger = setup_logger()

# ==========================================
# 3. State Management (Deduplication)
# ==========================

def load_seen_listing_ids(filepath: str = SEEN_IDS_FILE) -> Set[str]:
    """
    Loads previously processed listing IDs from disk to prevent duplicate notifications
    or redundant data processing in subsequent runs.
    
    Why: Kleinanzeigen listings stay live for weeks; without persistent deduplication,
    every run would re-extract and re-alert on the exact same items.
    """
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    logger.info(f"Loaded {len(data)} existing listing IDs from '{filepath}'")
                    return set(data)
        except Exception as err:
            logger.warning(f"Could not read seen IDs file '{filepath}': {err}. Starting with an empty set.")
    return set()

def save_seen_listing_ids(seen_ids: Set[str], filepath: str = SEEN_IDS_FILE) -> None:
    """
    Atomically writes updated set of seen listing IDs to disk.
    
    Why: Writing directly ensures that if the process terminates unexpectedly,
    already processed listings are safely persisted.
    """
    try:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(sorted(list(seen_ids)), f, indent=2, ensure_ascii=False)
        logger.info(f"Saved {len(seen_ids)} total seen listing IDs to '{filepath}'")
    except Exception as err:
        logger.error(f"Failed to persist seen listing IDs to '{filepath}': {err}")

# ==========================================
# 4. Search URL Builder
# ==========================================

def build_search_url(keyword: str, location_id: str = LOCATION_ID, page_number: int = 1) -> str:
    """
    Constructs the standard Kleinanzeigen search URL for a given keyword and location.
    
    Format:
    - Page 1: https://www.kleinanzeigen.de/s-dortmund/{encoded_keyword}/k0l2078
    - Page N: https://www.kleinanzeigen.de/s-dortmund/seite:{N}/{encoded_keyword}/k0l2078
    
    Why: Kleinanzeigen uses SEO-friendly routing paths. 'k0' signifies all categories,
    and 'l2078' is the canonical city ID for Dortmund.
    """
    # Clean and encode keyword for German URL path conventions (spaces replaced by hyphens or %20)
    cleaned_keyword = quote_plus(keyword.strip().lower())
    
    if page_number <= 1:
        return f"{BASE_URL}/s-dortmund/{cleaned_keyword}/k0l{location_id}"
    else:
        return f"{BASE_URL}/s-dortmund/seite:{page_number}/{cleaned_keyword}/k0l{location_id}"

# ==========================================
# 5. Browser & Context Setup
# ==========================================

async def create_stealth_browser_context(playwright_instance, headless: bool = True) -> BrowserContext:
    """
    Initializes a Chromium browser context configured with desktop headers, German locale,
    and a realistic user agent.
    
    Why these specific parameters:
    1. 'user_agent': Default headless Chromium user-agents contain 'HeadlessChrome', which
       is immediately flagged by Cloudflare/Akamai bot detection.
    2. 'locale=de-DE': Kleinanzeigen is a German marketplace. Non-German locales raise suspicion.
    3. 'viewport=1920x1080': Standard desktop dimensions prevent mobile layout reflows and banner overlaps.
    4. 'extra_http_headers': Mimics modern Chrome browser TLS/HTTP header order (Sec-CH-UA, DNT, etc.).
    """
    logger.info(f"Launching Chromium browser (headless={headless})...")
    browser = await playwright_instance.chromium.launch(
        headless=headless,
        args=[
            "--disable-blink-features=AutomationControlled",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-infobars",
            "--window-position=0,0",
            "--ignore-certificate-errors",
        ]
    )

    context = await browser.new_context(
        user_agent=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        viewport={"width": 1920, "height": 1080},
        locale="de-DE",
        timezone_id="Europe/Berlin",
        extra_http_headers={
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
            "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"Windows"',
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1"
        }
    )

    return context

# ==========================================
# 6. Page Interaction & Cookie Handling
# ==========================================

async def handle_cookie_consent(page: Page) -> None:
    """
    Detects and accepts the GDPR / CMP consent dialog if present on Kleinanzeigen.
    
    Why: The consent overlay modal blocks user interaction and obscures DOM elements.
    Accepting or closing it allows standard listing scraping without modal interruptions.
    """
    consent_selectors = [
        "#gdpr-banner-accept",
        "button#cmpwelcomebtn",
        "button[id*='accept']",
        "button:has-text('Alle akzeptieren')",
        "button:has-text('Einverstanden')",
        "button:has-text('Zustimmen')",
        "#banner-accept"
    ]

    for selector in consent_selectors:
        try:
            button = page.locator(selector).first
            if await button.is_visible(timeout=2500):
                logger.info(f"GDPR Consent modal detected with selector '{selector}'. Accepting...")
                await button.click()
                await page.wait_for_timeout(1000)  # Brief wait for modal to fade out
                return
        except Exception:
            continue
    logger.debug("No active cookie consent modal was displayed or blocking interaction.")

# ==========================================
# 7. Listing Extraction Logic
# ==========================================

async def extract_listings_from_page(page: Page, seen_ids: Set[str]) -> List[Dict[str, Any]]:
    """
    Parses all search result article cards on the current page.

    Kleinanzeigen DOM Structure (current and legacy):
    - Current cards: `li[data-clickable="card"] article[data-adid]`
    - Legacy cards: `article.aditem`, `li.ad-listitem article`
    - Attribute: `data-adid` provides unique integer listing ID (e.g. '2738918231')
    - Title & Link: `.text-module-begin a`, `.ellipsis`, or legacy `.aditem-main h2 a`
    - Price: `.aditem-main--middle--price-shipping--price`, `.aditem-details strong`, or current-price selectors
    - Description snippet: `.aditem-main--middle--description`, `.aditem-main p`, or generic text blocks
    - Location: `.aditem-main--top--left` or a simple text region in the current card
    - Post Date: `.aditem-main--top--right`

    Returns:
        List of newly extracted item dictionaries.
    """
    extracted_items: List[Dict[str, Any]] = []

    # Locate listing containers using both current and legacy markup.
    listing_elements = page.locator(
        "li[data-clickable='card'] article[data-adid], "
        "article[data-adid], "
        "article.aditem, "
        "li.ad-listitem article"
    )
    count = await listing_elements.count()
    logger.info(f"Found {count} listing cards on page.")

    if count == 0:
        logger.warning("No listings found. The page might be empty or selectors need adjustment.")
        return extracted_items

    for i in range(count):
        item_locator = listing_elements.nth(i)

        try:
            # 1. Extract Listing ID (data-adid)
            listing_id = await item_locator.get_attribute("data-adid")

            # If not in data attribute, try fallback from data-href or title link
            if not listing_id:
                link_href = await item_locator.locator("[data-href], a.ellipsis, h2 a, a[href*='/s-anzeige/']").first.get_attribute("href")
                if link_href and "/s-anzeige/" in link_href:
                    # e.g., /s-anzeige/defekter-laptop-dortmund/2738918231-168-2078 -> 2738918231
                    parts = link_href.split("/")[-1].split("-")
                    listing_id = parts[0] if parts else None

            if not listing_id:
                logger.debug(f"Skipping card #{i+1}: Could not resolve a valid listing ID.")
                continue

            # Deduplication check
            if listing_id in seen_ids:
                logger.debug(f"Skipping duplicate listing ID: {listing_id}")
                continue

            # 2. Extract Title & URL
            title_elem = item_locator.locator("h2 a, a.ellipsis, .text-module-begin a, .aditem-main h2 a").first
            title = await title_elem.inner_text() if await title_elem.count() > 0 else "N/A"
            title = title.strip()

            rel_url = await title_elem.get_attribute("href") if await title_elem.count() > 0 else ""
            if not rel_url:
                rel_url = await item_locator.get_attribute("data-href") or ""
            item_url = f"{BASE_URL}{rel_url}" if rel_url and rel_url.startswith("/") else (rel_url or "N/A")

            # 3. Extract Price
            price_elem = item_locator.locator(
                ".aditem-main--middle--price-shipping--price, "
                ".aditem-details strong, "
                "p[class*='price'], "
                "p[class*='Price'], "
                "[class*='price']"
            ).first
            price = await price_elem.inner_text() if await price_elem.count() > 0 else "Zu verschenken / VB"
            price = price.strip().replace("\n", " ")

            # 4. Extract Description Snippet
            desc_elem = item_locator.locator(
                ".aditem-main--middle--description, "
                ".aditem-main p, "
                "p.aditem-main--description, "
                "[class*='description']"
            ).first
            description = await desc_elem.inner_text() if await desc_elem.count() > 0 else ""
            description = description.strip().replace("\n", " ")

            # 5. Extract Location / District in Dortmund
            loc_elem = item_locator.locator(
                ".aditem-main--top--left, "
                "[class*='location'], "
                "div:has-text('Dortmund')"
            ).first
            location = await loc_elem.inner_text() if await loc_elem.count() > 0 else DEFAULT_LOCATION_NAME
            location = location.strip().replace("\n", " ")

            # 6. Extract Posted Date / Time
            date_elem = item_locator.locator(".aditem-main--top--right").first
            posted_date = await date_elem.inner_text() if await date_elem.count() > 0 else "N/A"
            posted_date = posted_date.strip()

            # Compile standard structured record
            search_query_slug = quote_plus(title[:30].strip().lower()) if title else "defekt"
            listing_data = {
                "listing_id": listing_id,
                "title": title,
                "price": price,
                "location": location,
                "description": description,
                "item_url": item_url,
                "search_url": f"{BASE_URL}/s-dortmund/{search_query_slug}/k0l{LOCATION_ID}",
                "live_category_url": f"{BASE_URL}/s-dortmund/defekt/k0l{LOCATION_ID}",
                "posted_date": posted_date,
                "scraped_at": datetime.utcnow().isoformat() + "Z"
            }

            extracted_items.append(listing_data)
            seen_ids.add(listing_id)
            logger.info(f"✨ [NEW] ID: {listing_id} | Price: {price} | Title: {title[:50]}...")

        except Exception as e:
            logger.warning(f"Error parsing item #{i+1}: {e}")
            continue

    return extracted_items

# ==========================================
# 8. Main Scraper Orchestrator
# ==========================================

async def run_scraper(
    keywords: List[str] = DEFAULT_KEYWORDS,
    max_pages: int = MAX_PAGES_PER_KEYWORD,
    headless: bool = True
) -> List[Dict[str, Any]]:
    """
    Main scraping loop iterating through keywords and pagination pages in Dortmund.
    
    Why: Using async Playwright provides high throughput with non-blocking I/O while
    controlling browser instances cleanly.
    """
    logger.info("=" * 60)
    logger.info("Starting Kleinanzeigen Defective Items Scraper (Dortmund)")
    logger.info(f"Keywords: {keywords} | Max Pages per keyword: {max_pages}")
    logger.info("=" * 60)

    seen_ids = load_seen_listing_ids()
    initial_seen_count = len(seen_ids)
    all_new_listings: List[Dict[str, Any]] = []

    async with async_playwright() as playwright:
        context = await create_stealth_browser_context(playwright, headless=headless)
        page = await context.new_page()

        try:
            for keyword in keywords:
                logger.info(f"\n>>> Searching for keyword: '{keyword}' in Dortmund...")

                for page_num in range(1, max_pages + 1):
                    target_url = build_search_url(keyword=keyword, page_number=page_num)
                    logger.info(f"Navigating to (Page {page_num}/{max_pages}): {target_url}")

                    try:
                        # Wait for DOM content to load with configurable timeout
                        response = await page.goto(
                            target_url,
                            wait_until="domcontentloaded",
                            timeout=PAGE_LOAD_TIMEOUT_MS
                        )

                        if response and response.status >= 400:
                            logger.error(f"HTTP Error {response.status} loading {target_url}")
                            break

                        # Handle cookie consent on first navigation
                        await handle_cookie_consent(page)

                        # Extra delay to allow dynamic listings and scripts to settle
                        # Why: Randomized jitter between 1.5s and 3.0s prevents predictable request intervals
                        jitter_ms = random.randint(1500, 3000)
                        await page.wait_for_timeout(jitter_ms)

                        # Extract items on this page
                        page_items = await extract_listings_from_page(page, seen_ids)
                        all_new_listings.extend(page_items)

                        logger.info(f"Page {page_num} finished. Extracted {len(page_items)} new listings.")

                        # If no items found on this page, stop further pagination for this keyword
                        if len(page_items) == 0 and page_num > 1:
                            logger.info(f"No more listings found on page {page_num}. Moving to next keyword.")
                            break

                    except PlaywrightTimeoutError:
                        logger.error(f"Timeout while loading {target_url}. Skipping page.")
                        continue
                    except Exception as err:
                        logger.error(f"Unexpected error during page navigation: {err}", exc_info=True)
                        continue

        finally:
            logger.info("Closing browser context and saving state...")
            await context.close()

    # Save updated seen IDs to disk
    save_seen_listing_ids(seen_ids)

    # Step 8.1: Run AI Profitability Analysis via Local LLM / Cloud Engine
    execution_mode = os.environ.get("EXECUTION_MODE", "local").lower()
    analyzer = LocalLLMAnalyzer(execution_mode=execution_mode)

    if all_new_listings:
        logger.info(f"\n--- Running AI Profitability Evaluation on {len(all_new_listings)} listings [{execution_mode.upper()} MODE] ---")
        for item in all_new_listings:
            try:
                analysis = analyzer.analyze_listing(
                    title=item.get("title", ""),
                    price_str=item.get("price", "0 €"),
                    description=item.get("description", ""),
                    category="Elektronik & Bastler",
                    min_profit_eur=float(os.environ.get("MIN_PROFIT_EUR", 30.0)),
                    max_repair_budget=float(os.environ.get("MAX_REPAIR_BUDGET", 150.0))
                )
                item["ai_analysis"] = analysis
            except Exception as e:
                logger.error(f"Failed to analyze item {item.get('listing_id')}: {e}")

    # Save results to JSON file
    if all_new_listings:
        # If previous output file exists, optionally merge or append
        existing_results = []
        if os.path.exists(OUTPUT_JSON_FILE):
            try:
                with open(OUTPUT_JSON_FILE, "r", encoding="utf-8") as f:
                    existing_results = json.load(f)
            except Exception:
                existing_results = []

        combined_results = existing_results + all_new_listings
        with open(OUTPUT_JSON_FILE, "w", encoding="utf-8") as f:
            json.dump(combined_results, f, indent=2, ensure_ascii=False)

        logger.info(f"Successfully saved {len(all_new_listings)} new listings to '{OUTPUT_JSON_FILE}'.")
    else:
        logger.info("No new unique listings found in this run.")

    logger.info("-" * 60)
    logger.info(f"Execution complete. New items extracted: {len(all_new_listings)}. Total seen: {len(seen_ids)} (+{len(seen_ids) - initial_seen_count})")
    logger.info("-" * 60)

    # Notify via Telegram if configured and new listings were found
    if all_new_listings:
        try:
            summary_lines = [f"New listings: {len(all_new_listings)}"]
            # Include brief lines for up to 5 items
            for itm in all_new_listings[:5]:
                lid = itm.get("listing_id")
                title = itm.get("title", "")
                price = itm.get("price", "")
                url = itm.get("item_url", "")
                summary_lines.append(f"• {price} — {title} ({url})")

            if len(all_new_listings) > 5:
                summary_lines.append(f"...and {len(all_new_listings) - 5} more listings")

            message_text = "\n".join(summary_lines)
            # send_telegram_message will read env vars if token/chat not provided
            send_telegram_message(text=message_text)
            logger.info("Telegram notification sent for new listings.")
        except Exception as e:
            logger.warning(f"Failed to send Telegram notification: {e}")

    return all_new_listings

# ==========================================
# 9. Entry Point & CLI Handler
# ==========================================

def parse_cli_args():
    parser = argparse.ArgumentParser(description="Kleinanzeigen Defect Scraper & Flip Engine (Dortmund)")
    parser.add_argument("--mode", choices=["local", "cloud"], default="local", help="Execution mode: local (Ollama/LM Studio) or cloud (Gemini/OpenAI)")
    parser.add_argument("--keywords", type=str, default="", help="Comma-separated keywords (default: 'defekt,für Bastler')")
    parser.add_argument("--pages", type=int, default=2, help="Number of pages to scrape per keyword (default: 2)")
    parser.add_argument("--headful", action="store_true", help="Launch browser with GUI visible for debugging")
    parser.add_argument("--smoke-test", action="store_true", help="Execute 30-second automated pipeline smoke test")
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_cli_args()

    if args.smoke_test:
        from smoke_test import SmokeTestRunner
        logger.info("Triggering 30-second automated pipeline smoke test...")
        runner = SmokeTestRunner(mode=args.mode)
        success = asyncio.run(runner.run_all())
        sys.exit(0 if success else 1)

    os.environ["EXECUTION_MODE"] = args.mode
    kw_list = [k.strip() for k in args.keywords.split(",") if k.strip()] if args.keywords else DEFAULT_KEYWORDS
    is_headless = not args.headful

    logger.info(f"Launching Kleinanzeigen Scraper in [{args.mode.upper()}] mode (Headless={is_headless}, Pages={args.pages})...")
    asyncio.run(run_scraper(keywords=kw_list, max_pages=args.pages, headless=is_headless))

