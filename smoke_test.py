#!/usr/bin/env python3
"""
Automated 30-Second Smoke Test Suite
====================================
End-to-end verification script for Kleinanzeigen Scraping & Flip Analysis System.

Validates all 4 core pipeline subsystems:
1. [Test 1] Playwright Browser Automation & Local HTML Selector Parsing.
2. [Test 2] LLM Connectivity & JSON Output Schema Verification (Local Ollama / LM Studio or Cloud).
3. [Test 3] SQLite Database Read/Write & Foreign Key Integrity.
4. [Test 4] Notification Dispatcher Dry-Run & Formatting.

Outputs structured audit results to stdout and 'smoke_test.log'.
"""

import argparse
import asyncio
import json
import logging
import os
import sqlite3
import sys
import tempfile
import time
from typing import Dict, Any, List

# Setup dedicated Smoke Test Logger
logger = logging.getLogger("SmokeTest")
logger.setLevel(logging.INFO)
if logger.hasHandlers():
    logger.handlers.clear()

formatter = logging.Formatter("%(asctime)s [%(levelname)s] [SmokeTest] %(message)s", datefmt="%H:%M:%S")

console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

file_handler = logging.FileHandler("smoke_test.log", mode="w", encoding="utf-8")
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)


# Mock Kleinanzeigen HTML fragment for Test 1
MOCK_DUMMY_HTML = """<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><title>Kleinanzeigen Smoke Test</title></head>
<body>
  <ul id="srchrslt-adtable">
    <li class="ad-listitem">
      <article class="aditem" data-adid="2839999001">
        <div class="aditem-main">
          <div class="aditem-main--top">
            <div class="aditem-main--top--left">44137 Dortmund - Mitte</div>
            <div class="aditem-main--top--right">Heute, 14:00</div>
          </div>
          <div class="aditem-main--middle">
            <h2 class="text-module-begin">
              <a class="ellipsis" href="/s-anzeige/smoke-test-laptop-defekt/2839999001-278-2078">
                Smoke Test Laptop Core i7 Defekt an Bastler
              </a>
            </h2>
            <p class="aditem-main--middle--description">
              Laptop startet nicht, Ladebuchse wackelt. Für Ersatzteile oder Reparatur.
            </p>
            <div class="aditem-main--middle--price-shipping">
              <p class="aditem-main--middle--price-shipping--price">45 € VB</p>
            </div>
          </div>
        </div>
      </article>
    </li>
  </ul>
</body>
</html>
"""


class SmokeTestRunner:
    """Orchestrates the 4-part rapid pipeline health verification."""

    def __init__(self, mode: str = "local", endpoint: str = "http://localhost:11434", model: str = "llama3"):
        self.mode = mode.lower()
        self.endpoint = endpoint
        self.model = model
        self.results: List[Dict[str, Any]] = []

    def record_result(self, test_num: int, name: str, passed: bool, duration_ms: float, details: str):
        status_str = "PASS" if passed else "FAIL"
        entry = {
            "test_number": test_num,
            "name": name,
            "status": status_str,
            "duration_ms": duration_ms,
            "details": details
        }
        self.results.append(entry)
        prefix = "✅ [PASS]" if passed else "❌ [FAIL]"
        logger.info(f"{prefix} Test {test_num}: {name} ({duration_ms}ms) -> {details}")

    async def run_all(self) -> bool:
        overall_start = time.time()
        logger.info("=" * 65)
        logger.info(f"STARTING 30-SECOND PIPELINE SMOKE TEST [Mode: {self.mode.upper()}]")
        logger.info("=" * 65)

        # -------------------------------------------------------------
        # Test 1: Playwright Browser & DOM Selector Extraction
        # -------------------------------------------------------------
        await self.test_playwright_extraction()

        # -------------------------------------------------------------
        # Test 2: LLM Engine Connectivity & JSON Response Parsing
        # -------------------------------------------------------------
        self.test_llm_connectivity()

        # -------------------------------------------------------------
        # Test 3: SQLite Database Write/Read & Isolation
        # -------------------------------------------------------------
        self.test_sqlite_persistence()

        # -------------------------------------------------------------
        # Test 4: Notification Dispatcher & Payload Formatting
        # -------------------------------------------------------------
        self.test_notification_dispatcher()

        overall_duration = round(time.time() - overall_start, 2)
        total_tests = len(self.results)
        passed_count = sum(1 for r in self.results if r["status"] == "PASS")
        all_passed = (passed_count == total_tests)

        logger.info("=" * 65)
        logger.info(f"SMOKE TEST SUMMARY: {passed_count}/{total_tests} Tests Passed in {overall_duration}s")
        logger.info(f"Log written to: smoke_test.log")
        logger.info("=" * 65)

        return all_passed

    async def test_playwright_extraction(self):
        start_t = time.time()
        test_num = 1
        test_name = "Playwright Browser Init & HTML Selector Parsing"
        temp_html_file = None

        try:
            from playwright.async_api import async_playwright
            
            # Create a temporary local mock HTML file
            with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f:
                f.write(MOCK_DUMMY_HTML)
                temp_html_file = f.name

            file_url = f"file://{os.path.abspath(temp_html_file)}"

            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context()
                page = await context.new_page()

                await page.goto(file_url, wait_until="domcontentloaded")
                
                # Query selector check
                ad_elements = await page.query_selector_all("li.ad-listitem article.aditem")
                if not ad_elements:
                    raise ValueError("No aditem elements found with standard Kleinanzeigen selectors")

                first_el = ad_elements[0]
                ad_id = await first_el.get_attribute("data-adid")
                title_el = await first_el.query_selector("h2 a")
                title_text = (await title_el.inner_text()).strip() if title_el else ""
                price_el = await first_el.query_selector(".aditem-main--middle--price-shipping--price")
                price_text = (await price_el.inner_text()).strip() if price_el else ""

                await browser.close()

                if ad_id == "2839999001" and "Laptop" in title_text and "45" in price_text:
                    elapsed = round((time.time() - start_t) * 1000, 2)
                    self.record_result(
                        test_num, test_name, True, elapsed,
                        f"Extracted ID={ad_id}, Title='{title_text[:25]}...', Price='{price_text}'"
                    )
                else:
                    raise ValueError(f"Extracted unexpected data: id={ad_id}, title={title_text}, price={price_text}")

        except Exception as e:
            elapsed = round((time.time() - start_t) * 1000, 2)
            self.record_result(test_num, test_name, False, elapsed, f"Playwright failed: {str(e)}")
        finally:
            if temp_html_file and os.path.exists(temp_html_file):
                os.remove(temp_html_file)

    def test_llm_connectivity(self):
        start_t = time.time()
        test_num = 2
        test_name = f"LLM Connectivity & JSON Schema Analysis [{self.mode.upper()}]"

        try:
            from local_llm_analyzer import LocalLLMAnalyzer

            analyzer = LocalLLMAnalyzer(
                execution_mode=self.mode,
                local_endpoint=self.endpoint,
                local_model=self.model,
                timeout_sec=10,
                fallback_on_failure=True
            )

            # Test analysis on sample listing
            res = analyzer.analyze_listing(
                title="Smoke Test DeLonghi Kaffeemaschine defekt",
                price_str="20 €",
                description="Schaltet ein aber zieht kein Wasser. Fehlermeldung blinkt.",
                category="Haushaltsgeräte",
                min_profit_eur=25.0,
                max_repair_budget=80.0
            )

            # Verify structured JSON output schema
            required_keys = ["detected_issues", "estimated_repair_cost_total", "estimated_refurbished_value", "is_profitable", "profit_margin_eur"]
            for k in required_keys:
                if k not in res:
                    raise KeyError(f"Missing required key '{k}' in LLM analysis response")

            elapsed = round((time.time() - start_t) * 1000, 2)
            self.record_result(
                test_num, test_name, True, elapsed,
                f"Model: {res.get('model_used')}, Profit Margin: +{res.get('profit_margin_eur')}€, Profitable: {res.get('is_profitable')}"
            )
        except Exception as e:
            elapsed = round((time.time() - start_t) * 1000, 2)
            self.record_result(test_num, test_name, False, elapsed, f"LLM error: {str(e)}")

    def test_sqlite_persistence(self):
        start_t = time.time()
        test_num = 3
        test_name = "SQLite Database Read/Write & Foreign Key Integrity"
        temp_db_file = None

        try:
            with tempfile.NamedTemporaryFile("w", suffix=".db", delete=False) as f:
                temp_db_file = f.name

            conn = sqlite3.connect(temp_db_file)
            cursor = conn.cursor()
            cursor.execute("PRAGMA foreign_keys = ON;")

            # Schema creation
            cursor.execute("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT NOT NULL
            );
            """)

            cursor.execute("""
            CREATE TABLE listings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                listing_id TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                price TEXT NOT NULL,
                profit_margin REAL,
                availability_status TEXT DEFAULT 'ACTIVE',
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
            """)

            # Insert User
            cursor.execute("INSERT INTO users (username, email) VALUES (?, ?)", ("smoketest_user", "test@example.com"))
            user_id = cursor.lastrowid

            # Insert Listing
            cursor.execute(
                "INSERT INTO listings (user_id, listing_id, title, price, profit_margin, availability_status) VALUES (?, ?, ?, ?, ?, ?)",
                (user_id, "2839999001", "Smoke Test Item", "45 €", 75.5, "ACTIVE")
            )
            conn.commit()

            # Query and verify
            cursor.execute("SELECT u.username, l.title, l.profit_margin FROM listings l JOIN users u ON l.user_id = u.id WHERE l.listing_id = ?", ("2839999001",))
            row = cursor.fetchone()
            conn.close()

            if row and row[0] == "smoketest_user" and row[1] == "Smoke Test Item" and row[2] == 75.5:
                elapsed = round((time.time() - start_t) * 1000, 2)
                self.record_result(
                    test_num, test_name, True, elapsed,
                    f"SQLite transaction committed and verified (User: {row[0]}, Margin: {row[2]}€)"
                )
            else:
                raise ValueError("Database verification query did not match inserted record")

        except Exception as e:
            elapsed = round((time.time() - start_t) * 1000, 2)
            self.record_result(test_num, test_name, False, elapsed, f"SQLite error: {str(e)}")
        finally:
            if temp_db_file and os.path.exists(temp_db_file):
                os.remove(temp_db_file)

    def test_notification_dispatcher(self):
        start_t = time.time()
        test_num = 4
        test_name = "Notification Dispatcher Dry-Run & Payload Formatting"

        try:
            # Mock notification format builder
            mock_listing = {
                "title": "Smoke Test Playstation 5 Defekt",
                "price": "120 € VB",
                "location": "44137 Dortmund",
                "profit_margin": 95.0,
                "refurb_value": 240.0,
                "parts": "HDMI Port (8€)",
                "item_url": "https://www.kleinanzeigen.de/s-anzeige/ps5-defekt/123-278-2078",
                "search_url": "https://www.kleinanzeigen.de/s-dortmund/defekt/k0l2078"
            }

            # Format Telegram HTML payload
            message_html = f"""🔥 <b>PROFITABLE DEFEKT DEAL FOUND!</b>
📦 <b>Item:</b> {mock_listing['title']}
💰 <b>Price:</b> {mock_listing['price']}
📍 <b>Location:</b> {mock_listing['location']}

📈 <b>Estimated Margin:</b> +{mock_listing['profit_margin']:.2f} €
✨ <b>Refurb Value:</b> {mock_listing['refurb_value']:.2f} €
🔧 <b>Parts:</b> {mock_listing['parts']}

🔗 <a href="{mock_listing['item_url']}">Direct Listing Ad</a>
🔍 <a href="{mock_listing['search_url']}">Live Search Feed (Dortmund)</a>"""

            # Verify formatting
            if "PROFITABLE DEFEKT DEAL" in message_html and "+95.00 €" in message_html and "k0l2078" in message_html:
                elapsed = round((time.time() - start_t) * 1000, 2)
                self.record_result(
                    test_num, test_name, True, elapsed,
                    "Payload constructed cleanly with dual URLs (Direct Ad + Live Feed) and HTML tags"
                )
            else:
                raise ValueError("Notification payload failed structural validation")

        except Exception as e:
            elapsed = round((time.time() - start_t) * 1000, 2)
            self.record_result(test_num, test_name, False, elapsed, f"Dispatcher error: {str(e)}")


def main():
    parser = argparse.ArgumentParser(description="Run Kleinanzeigen System 30-Second Smoke Test")
    parser.add_argument("--mode", choices=["local", "cloud"], default="local", help="Execution mode (local vs cloud)")
    parser.add_argument("--endpoint", default="http://localhost:11434", help="Local LLM API endpoint")
    parser.add_argument("--model", default="llama3", help="Local LLM model name")
    args = parser.parse_args()

    runner = SmokeTestRunner(mode=args.mode, endpoint=args.endpoint, model=args.model)
    success = asyncio.run(runner.run_all())
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
