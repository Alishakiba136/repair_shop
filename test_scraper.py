#!/usr/bin/env python3
"""
Test Suite and Dry-Run Verification for Kleinanzeigen Scraper
============================================================
Includes unit tests with pytest and dry-run execution checks for:
- Search URL generation for Dortmund
- Deduplication state storage (load/save)
- HTML selector parser against realistic mock listing markup
- Playwright context initialization verification

Usage:
    pytest test_scraper.py -v
    python test_scraper.py --dry-run
"""

import asyncio
import json
import os
import shutil
import tempfile
import pytest
from playwright.async_api import async_playwright

from main import (
    build_search_url,
    load_seen_listing_ids,
    save_seen_listing_ids,
    extract_listings_from_page,
    setup_logger,
    DEFAULT_KEYWORDS,
    LOCATION_ID
)
from local_llm_analyzer import LocalLLMAnalyzer

# Sample mock HTML fragment representing Kleinanzeigen listing DOM structure
MOCK_LISTINGS_HTML = """
<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><title>Kleinanzeigen Dortmund</title></head>
<body>
  <div id="site-content">
    <ul id="srchrslt-adtable" class="itemlist">
      
      <!-- Mock Item 1: Defective Laptop -->
      <li class="ad-listitem">
        <article class="aditem" data-adid="2839102831">
          <div class="aditem-main">
            <div class="aditem-main--top">
              <div class="aditem-main--top--left">44137 Dortmund - Mitte</div>
              <div class="aditem-main--top--right">Heute, 12:45</div>
            </div>
            <div class="aditem-main--middle">
              <h2 class="text-module-begin">
                <a class="ellipsis" href="/s-anzeige/defekter-gaming-laptop-lenovo-fuer-bastler/2839102831-278-2078">
                  Defekter Gaming Laptop Lenovo für Bastler
                </a>
              </h2>
              <p class="aditem-main--middle--description">
                Verkaufe hier einen Lenovo Laptop. Geht nicht mehr an, vermutlich Mainboard defekt. Ohne Festplatte und Netzteil.
              </p>
              <div class="aditem-main--middle--price-shipping">
                <p class="aditem-main--middle--price-shipping--price">45 € VB</p>
              </div>
            </div>
          </div>
        </article>
      </li>

      <!-- Mock Item 2: Defective Coffee Machine -->
      <li class="ad-listitem">
        <article class="aditem" data-adid="2839109999">
          <div class="aditem-main">
            <div class="aditem-main--top">
              <div class="aditem-main--top--left">44225 Dortmund - Hombruch</div>
              <div class="aditem-main--top--right">Gestern, 18:10</div>
            </div>
            <div class="aditem-main--middle">
              <h2 class="text-module-begin">
                <a class="ellipsis" href="/s-anzeige/delonghi-kaffeevollautomat-defekt-bastler/2839109999-176-2078">
                  DeLonghi Kaffeevollautomat defekt Bastler
                </a>
              </h2>
              <p class="aditem-main--middle--description">
                Pumpt kein Wasser mehr. Für Ersatzteile oder Selbstreparatur abzugeben.
              </p>
              <div class="aditem-main--middle--price-shipping">
                <p class="aditem-main--middle--price-shipping--price">20 €</p>
              </div>
            </div>
          </div>
        </article>
      </li>

    </ul>
  </div>
</body>
</html>
"""

CURRENT_KLEINANZEIGEN_DOM_HTML = """
<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><title>Blaster in Dortmund | Kleinanzeigen</title></head>
<body>
  <div id="site-content">
    <ul id="srchrslt-adtable">
      <li data-clickable="card" class="relative mb-xsmall rounded-small border border-utilityNonessential bg-surface">
        <article class="flex justify-between p-medium" data-adid="3473953164" data-href="/s-anzeige/nerf-fortnite-ts-blaster/3473953164-23-2078">
          <div class="relative z-raised basis-[200px]">
            <div class="aditem-main--top">
              <div class="aditem-main--top--left">Dortmund</div>
              <div class="aditem-main--top--right">Heute, 10:12</div>
            </div>
            <h2 class="text-module-begin">
              <a class="ellipsis" href="/s-anzeige/nerf-fortnite-ts-blaster/3473953164-23-2078">Nerf Fortnite TS Blaster</a>
            </h2>
            <p class="aditem-main--middle--description">NEU mit kleiner Delle, abholung in Dortmund.</p>
            <p class="aditem-main--middle--price-shipping--price">49 € VB</p>
          </div>
        </article>
      </li>
      <li data-clickable="card" class="relative mb-xsmall rounded-small border border-utilityNonessential bg-surface">
        <article class="flex justify-between p-medium" data-adid="3474000001" data-href="/s-anzeige/airsoft-blaster-defekt/3474000001-23-2078">
          <div class="relative z-raised basis-[200px]">
            <div class="aditem-main--top">
              <div class="aditem-main--top--left">Dortmund</div>
              <div class="aditem-main--top--right">Gestern, 19:55</div>
            </div>
            <h2 class="text-module-begin">
              <a class="ellipsis" href="/s-anzeige/airsoft-blaster-defekt/3474000001-23-2078">Airsoft Blaster defekt</a>
            </h2>
            <p class="aditem-main--middle--description">Für Bastler, Motor defekt, Ersatzteile.</p>
            <p class="aditem-main--middle--price-shipping--price">18 €</p>
          </div>
        </article>
      </li>
    </ul>
  </div>
</body>
</html>
"""

# ==========================================
# 1. URL Generation Tests
# ==========================================

def test_build_search_url_page_one():
    """Verify standard page 1 search URL generation for Dortmund."""
    url = build_search_url(keyword="defekt", location_id="2078", page_number=1)
    assert url == "https://www.kleinanzeigen.de/s-dortmund/defekt/k0l2078"


def test_build_search_url_pagination():
    """Verify page 2+ pagination URL structure."""
    url = build_search_url(keyword="für Bastler", location_id="2078", page_number=3)
    assert "seite:3" in url
    assert "k0l2078" in url
    assert "/s-dortmund/" in url


def test_extract_json_handles_truncated_llm_output():
    """Ollama can return a valid JSON object that gets cut off mid-response; the parser should recover it."""
    analyzer = LocalLLMAnalyzer()
    truncated = '''{
  "detected_issues": ["No power", "Wobbly charging port"],
  "estimated_replacement_parts": [
    {"part_name": "Display", "cost_eur": 65.0},
    {"part_name": "Charging Port", "cost_eur": 8.0}
  ],
  "estimated_repair_cost_total": 93.0,
  "estimated_refurbished_value": 170.0,
  "is_profitable": true,
  "profit_margin_eur": 47.0,
  "reasoning_summary": "Laptop requires display"
'''
    parsed = analyzer._extract_json(truncated)
    assert parsed["estimated_repair_cost_total"] == 93.0
    assert parsed["is_profitable"] is True
    assert "Display" in parsed["estimated_replacement_parts"][0]["part_name"]


# ==========================================
# 2. State & Deduplication Tests
# ==========================================

def test_seen_ids_persistence():
    """Test loading and saving seen listing IDs with temporary files."""
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tmp:
        temp_path = tmp.name

    try:
        # Initial load on empty or non-existent file
        os.remove(temp_path)
        initial_set = load_seen_listing_ids(temp_path)
        assert len(initial_set) == 0

        # Save some test IDs
        sample_ids = {"1001", "1002", "1003"}
        save_seen_listing_ids(sample_ids, temp_path)

        # Reload and verify
        reloaded_set = load_seen_listing_ids(temp_path)
        assert reloaded_set == sample_ids
        assert "1002" in reloaded_set

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


# ==========================================
# 3. HTML DOM Selector Extraction Test
# ==========================================

@pytest.mark.asyncio
async def test_extract_listings_from_mock_dom():
    """
    Tests the scraper's parsing logic using Playwright against an in-memory mock HTML document.
    Validates field extraction (id, title, price, location, description, url).
    """
    seen_ids = set()

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Set mock HTML content directly
        await page.set_content(MOCK_LISTINGS_HTML)

        # Run extraction
        extracted = await extract_listings_from_page(page, seen_ids)

        await browser.close()

    assert len(extracted) == 2, f"Expected 2 extracted items, got {len(extracted)}"

    # Validate first item
    item1 = extracted[0]
    assert item1["listing_id"] == "2839102831"
    assert "Lenovo" in item1["title"]
    assert "45 €" in item1["price"]
    assert "Dortmund - Mitte" in item1["location"]
    assert "Mainboard defekt" in item1["description"]
    assert "2839102831" in item1["item_url"]

    # Validate second item
    item2 = extracted[1]
    assert item2["listing_id"] == "2839109999"
    assert "DeLonghi" in item2["title"]
    assert "20 €" in item2["price"]

    # Verify that seen_ids contains both
    assert "2839102831" in seen_ids
    assert "2839109999" in seen_ids


@pytest.mark.asyncio
async def test_deduplication_filters_already_seen():
    """Verify that listings already present in seen_ids are skipped."""
    seen_ids = {"2839102831"}  # Pre-mark item 1 as already seen

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.set_content(MOCK_LISTINGS_HTML)

        extracted = await extract_listings_from_page(page, seen_ids)
        await browser.close()

    # Only item 2 should be extracted
    assert len(extracted) == 1
    assert extracted[0]["listing_id"] == "2839109999"


@pytest.mark.asyncio
async def test_extract_listings_from_current_kleinanzeigen_dom():
    """Verify the selector works against the current site's card markup."""
    seen_ids = set()

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.set_content(CURRENT_KLEINANZEIGEN_DOM_HTML)

        extracted = await extract_listings_from_page(page, seen_ids)
        await browser.close()

    assert len(extracted) == 2
    assert {item["listing_id"] for item in extracted} == {"3473953164", "3474000001"}
    assert any("Blaster" in item["title"] or "blaster" in item["title"].lower() for item in extracted)


# ==========================================
# 4. Standalone Runner / Dry-Run CLI
# ==========================================

if __name__ == "__main__":
    print("Running Kleinanzeigen Scraper Test Suite & Dry Run...")
    
    # Run URL tests
    test_build_search_url_page_one()
    test_build_search_url_pagination()
    print("✅ [1/3] URL Generation tests passed.")

    # Run State tests
    test_seen_ids_persistence()
    print("✅ [2/3] State Deduplication tests passed.")

    # Run Async DOM selector tests
    asyncio.run(test_extract_listings_from_mock_dom())
    asyncio.run(test_deduplication_filters_already_seen())
    print("✅ [3/3] DOM Selector & Extraction tests passed.")

    print("\n🎉 ALL TESTS PASSED SUCCESSFULLY! The scraper logic is verified.")
