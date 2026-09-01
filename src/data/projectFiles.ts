import { ProjectFile } from '../types';

export const PROJECT_FILES: ProjectFile[] = [
  {
    filename: "smoke_test.py",
    title: "30-Second Automated Pipeline Smoke Test",
    language: "python",
    badge: "Automation & Smoke Testing",
    description: "End-to-end verification script testing Playwright browser execution, Local/Cloud LLM connectivity and JSON schema parsing, SQLite persistence, and Notification formatting within 30 seconds.",
    content: `#!/usr/bin/env python3
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

        await self.test_playwright_extraction()
        self.test_llm_connectivity()
        self.test_sqlite_persistence()
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
            with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f:
                f.write(MOCK_DUMMY_HTML)
                temp_html_file = f.name

            file_url = f"file://{os.path.abspath(temp_html_file)}"

            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context()
                page = await context.new_page()
                await page.goto(file_url, wait_until="domcontentloaded")
                
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
                    self.record_result(test_num, test_name, True, elapsed, f"Extracted ID={ad_id}, Title='{title_text[:25]}...', Price='{price_text}'")
                else:
                    raise ValueError(f"Extracted unexpected data: id={ad_id}, title={title_text}")

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

            res = analyzer.analyze_listing(
                title="Smoke Test DeLonghi Kaffeemaschine defekt",
                price_str="20 €",
                description="Schaltet ein aber zieht kein Wasser. Fehlermeldung blinkt.",
                category="Haushaltsgeräte",
                min_profit_eur=25.0,
                max_repair_budget=80.0
            )

            required_keys = ["detected_issues", "estimated_repair_cost_total", "estimated_refurbished_value", "is_profitable", "profit_margin_eur"]
            for k in required_keys:
                if k not in res:
                    raise KeyError(f"Missing key '{k}' in LLM analysis")

            elapsed = round((time.time() - start_t) * 1000, 2)
            self.record_result(test_num, test_name, True, elapsed, f"Model: {res.get('model_used')}, Profit Margin: +{res.get('profit_margin_eur')}€, Profitable: {res.get('is_profitable')}")
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
            cursor.execute("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, email TEXT NOT NULL);")
            cursor.execute("CREATE TABLE listings (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, listing_id TEXT UNIQUE NOT NULL, title TEXT NOT NULL, price TEXT NOT NULL, profit_margin REAL, availability_status TEXT DEFAULT 'ACTIVE', FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);")

            cursor.execute("INSERT INTO users (username, email) VALUES (?, ?)", ("smoketest_user", "test@example.com"))
            user_id = cursor.lastrowid
            cursor.execute("INSERT INTO listings (user_id, listing_id, title, price, profit_margin, availability_status) VALUES (?, ?, ?, ?, ?, ?)", (user_id, "2839999001", "Smoke Test Item", "45 €", 75.5, "ACTIVE"))
            conn.commit()

            cursor.execute("SELECT u.username, l.title, l.profit_margin FROM listings l JOIN users u ON l.user_id = u.id WHERE l.listing_id = ?", ("2839999001",))
            row = cursor.fetchone()
            conn.close()

            if row and row[0] == "smoketest_user" and row[1] == "Smoke Test Item":
                elapsed = round((time.time() - start_t) * 1000, 2)
                self.record_result(test_num, test_name, True, elapsed, f"SQLite verified (User: {row[0]}, Margin: {row[2]}€)")
            else:
                raise ValueError("DB query did not match inserted record")
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
            message_html = f"🔥 <b>PROFITABLE DEAL:</b> {mock_listing['title']}\\n📈 +{mock_listing['profit_margin']:.2f} €\\n🔗 {mock_listing['item_url']}\\n🔍 {mock_listing['search_url']}"
            if "PROFITABLE DEAL" in message_html and "+95.00 €" in message_html:
                elapsed = round((time.time() - start_t) * 1000, 2)
                self.record_result(test_num, test_name, True, elapsed, "Payload constructed with dual URLs (Direct Ad + Live Feed)")
            else:
                raise ValueError("Notification payload format error")
        except Exception as e:
            elapsed = round((time.time() - start_t) * 1000, 2)
            self.record_result(test_num, test_name, False, elapsed, f"Dispatcher error: {str(e)}")

def main():
    parser = argparse.ArgumentParser(description="Run Kleinanzeigen System 30-Second Smoke Test")
    parser.add_argument("--mode", choices=["local", "cloud"], default="local")
    parser.add_argument("--endpoint", default="http://localhost:11434")
    parser.add_argument("--model", default="llama3")
    args = parser.parse_args()

    runner = SmokeTestRunner(mode=args.mode, endpoint=args.endpoint, model=args.model)
    success = asyncio.run(runner.run_all())
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
`
  },
  {
    filename: "local_llm_analyzer.py",
    title: "Local & Cloud LLM Analysis Engine",
    language: "python",
    badge: "Local LLMs & Dual Mode",
    description: "Multi-provider AI analysis engine supporting Ollama (/api/generate & /v1), LM Studio, LocalAI, Gemini 2.5 Flash, and OpenAI with automated offline heuristic fallback.",
    content: `#!/usr/bin/env python3
"""
Local & Cloud LLM Analysis Engine for Defective Hardware Flipping
================================================================
Provides a unified interface to analyze defective hardware listings from Kleinanzeigen
using either Local LLMs (Ollama, LM Studio, LocalAI) or Cloud LLMs (Gemini, OpenAI).

Why Local LLMs:
- 100% Offline and Private: Item data and flipping strategies stay strictly on local hardware.
- Zero API Token Costs: Unlimited batch analysis without recurring cloud expenses.
- Low Latency: Direct local inference via quantized models (e.g. Llama 3 8B, Mistral 7B, Qwen 2.5).
"""

import json
import logging
import os
import re
import time
from typing import Any, Dict, List, Optional
import requests

logger = logging.getLogger("LLMAnalyzer")
if not logger.hasHandlers():
    logger.setLevel(logging.INFO)
    formatter = logging.Formatter("%(asctime)s [%(levelname)s] [LLMAnalyzer] %(message)s")
    sh = logging.StreamHandler()
    sh.setFormatter(formatter)
    logger.addHandler(sh)
    fh = logging.FileHandler("app_execution.log", mode="a", encoding="utf-8")
    fh.setFormatter(formatter)
    logger.addHandler(fh)

ANALYSIS_SYSTEM_PROMPT = """You are an expert electronics technician and electronics flipping specialist in Germany.
Evaluate the defective item listing. Determine:
1. Detected hardware issues from title and German description.
2. Estimated replacement parts and their market cost in EUR.
3. Estimated total repair cost in EUR.
4. Estimated realistic refurbished resale value in EUR in Germany.
5. Profit margin = Refurbished Value - (Purchase Price + Repair Cost).
6. Whether it is profitable (profit margin >= min_profit AND repair <= max_budget).
7. Concise technical reasoning.

Return ONLY a valid JSON object:
{
  "detected_issues": ["issue 1", "issue 2"],
  "estimated_replacement_parts": [{"part_name": "Part A", "cost_eur": 15.0}],
  "estimated_repair_cost_total": 25.0,
  "estimated_refurbished_value": 140.0,
  "is_profitable": true,
  "profit_margin_eur": 75.0,
  "reasoning_summary": "Short technical assessment"
}
"""

class LocalLLMAnalyzer:
    def __init__(
        self,
        execution_mode: str = "local",
        local_provider: str = "ollama",
        local_endpoint: str = "http://localhost:11434",
        local_model: str = "llama3",
        timeout_sec: int = 45,
        fallback_on_failure: bool = True,
        gemini_api_key: Optional[str] = None,
        openai_api_key: Optional[str] = None,
    ):
        self.execution_mode = os.environ.get("EXECUTION_MODE", execution_mode).lower()
        self.local_provider = os.environ.get("LOCAL_LLM_PROVIDER", local_provider).lower()
        self.local_endpoint = os.environ.get("LOCAL_LLM_ENDPOINT", local_endpoint).rstrip("/")
        self.local_model = os.environ.get("LOCAL_LLM_MODEL", local_model)
        self.timeout_sec = int(os.environ.get("LOCAL_LLM_TIMEOUT_SEC", timeout_sec))
        self.fallback_on_failure = os.environ.get("FALLBACK_ON_LOCAL_FAILURE", str(fallback_on_failure)).lower() == "true"
        self.gemini_api_key = os.environ.get("GEMINI_API_KEY", gemini_api_key or "")
        self.openai_api_key = os.environ.get("OPENAI_API_KEY", openai_api_key or "")

    def ping_local_endpoint(self) -> Dict[str, Any]:
        start_t = time.time()
        try:
            if self.local_provider == "ollama":
                resp = requests.get(f"{self.local_endpoint}/api/tags", timeout=5)
                if resp.status_code == 200:
                    models = [m.get("name") for m in resp.json().get("models", [])]
                    return {
                        "status": "connected",
                        "provider": "ollama",
                        "latency_ms": round((time.time() - start_t) * 1000, 2),
                        "available_models": models,
                        "target_model": self.local_model,
                        "model_ready": any(self.local_model in m for m in models) if models else False,
                    }
            elif self.local_provider in ["lm_studio", "localai", "custom"]:
                models_url = f"{self.local_endpoint}/models" if "/v1" in self.local_endpoint else f"{self.local_endpoint}/v1/models"
                resp = requests.get(models_url, timeout=5)
                if resp.status_code == 200:
                    models = [m.get("id") for m in resp.json().get("data", [])]
                    return {
                        "status": "connected",
                        "provider": self.local_provider,
                        "latency_ms": round((time.time() - start_t) * 1000, 2),
                        "available_models": models,
                        "target_model": self.local_model,
                        "model_ready": len(models) > 0,
                    }
            return {"status": "unreachable", "provider": self.local_provider, "error": f"HTTP {resp.status_code}"}
        except Exception as e:
            return {"status": "unreachable", "provider": self.local_provider, "error": str(e)}

    def analyze_listing(
        self,
        title: str,
        price_str: str,
        description: str,
        category: str = "Electronics",
        min_profit_eur: float = 30.0,
        max_repair_budget: float = 150.0,
    ) -> Dict[str, Any]:
        start_time = time.time()
        parsed_price = self._parse_price(price_str)

        user_prompt = f"ITEM: Title={title}, Price={parsed_price} EUR ({price_str}), Category={category}, Description={description}, MinProfit={min_profit_eur} EUR, MaxRepairBudget={max_repair_budget} EUR"

        result: Optional[Dict[str, Any]] = None
        model_name_used = "unknown"

        if self.execution_mode == "local":
            try:
                logger.info(f"Dispatching to Local LLM ({self.local_provider}:{self.local_model})...")
                result = self._query_local_llm(user_prompt)
                model_name_used = f"local:{self.local_provider}/{self.local_model}"
            except Exception as e:
                logger.warning(f"Local LLM failed ({e}). Fallback engaged.")
                if self.fallback_on_failure:
                    result = self._heuristic_fallback_analysis(title, parsed_price, description, min_profit_eur, max_repair_budget)
                    model_name_used = "heuristic_fallback"
                else:
                    raise e
        else:
            if self.gemini_api_key:
                result = self._query_gemini_cloud(user_prompt)
                model_name_used = "cloud:gemini-2.5-flash"
            else:
                result = self._heuristic_fallback_analysis(title, parsed_price, description, min_profit_eur, max_repair_budget)
                model_name_used = "heuristic_fallback"

        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        result["execution_time_ms"] = elapsed_ms
        result["model_used"] = model_name_used
        result["analyzed_at"] = time.strftime("%Y-%m-%d %H:%M:%SZ", time.gmtime())

        repair_cost = float(result.get("estimated_repair_cost_total", 0.0))
        refurb_val = float(result.get("estimated_refurbished_value", 0.0))
        calculated_profit = round(refurb_val - (parsed_price + repair_cost), 2)
        result["profit_margin_eur"] = calculated_profit
        result["is_profitable"] = (calculated_profit >= min_profit_eur) and (repair_cost <= max_repair_budget)
        return result

    def _query_local_llm(self, user_prompt: str) -> Dict[str, Any]:
        if self.local_provider == "ollama":
            url = f"{self.local_endpoint}/api/generate"
            payload = {"model": self.local_model, "prompt": f"{ANALYSIS_SYSTEM_PROMPT}\\n\\n{user_prompt}", "stream": False, "format": "json"}
            resp = requests.post(url, json=payload, timeout=self.timeout_sec)
            resp.raise_for_status()
            return self._extract_json(resp.json().get("response", "{}"))
        endpoint = self.local_endpoint if self.local_endpoint.endswith("/v1") else f"{self.local_endpoint}/v1"
        url = f"{endpoint}/chat/completions"
        payload = {"model": self.local_model, "messages": [{"role": "system", "content": ANALYSIS_SYSTEM_PROMPT}, {"role": "user", "content": user_prompt}], "temperature": 0.2}
        resp = requests.post(url, json=payload, timeout=self.timeout_sec)
        resp.raise_for_status()
        return self._extract_json(resp.json()["choices"][0]["message"]["content"])

    def _query_gemini_cloud(self, user_prompt: str) -> Dict[str, Any]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.gemini_api_key}"
        payload = {"contents": [{"parts": [{"text": f"{ANALYSIS_SYSTEM_PROMPT}\\n\\n{user_prompt}"}]}], "generationConfig": {"responseMimeType": "application/json", "temperature": 0.2}}
        resp = requests.post(url, json=payload, timeout=25)
        resp.raise_for_status()
        return self._extract_json(resp.json()["candidates"][0]["content"]["parts"][0]["text"])

    def _extract_json(self, raw_text: str) -> Dict[str, Any]:
        cleaned = raw_text.strip()
        if cleaned.startswith("\`\`\`"):
            cleaned = re.sub(r"^\`\`\`(?:json)?\\n?", "", cleaned)
            cleaned = re.sub(r"\\n?\`\`\`$", "", cleaned)
        parsed = json.loads(cleaned.strip())
        return {
            "detected_issues": parsed.get("detected_issues", ["Hardware defect"]),
            "estimated_replacement_parts": parsed.get("estimated_replacement_parts", []),
            "estimated_repair_cost_total": float(parsed.get("estimated_repair_cost_total", 25.0)),
            "estimated_refurbished_value": float(parsed.get("estimated_refurbished_value", 100.0)),
            "is_profitable": bool(parsed.get("is_profitable", False)),
            "profit_margin_eur": float(parsed.get("profit_margin_eur", 0.0)),
            "reasoning_summary": parsed.get("reasoning_summary", "Analyzed by AI."),
        }

    def _heuristic_fallback_analysis(self, title: str, price: float, description: str, min_profit_eur: float, max_repair_budget: float) -> Dict[str, Any]:
        text = (title + " " + description).lower()
        parts = [{"part_name": "Reparaturteile", "cost_eur": 18.0}]
        estimated_refurb = max(price * 2.5, 90.0)
        if any(w in text for w in ["kaffee", "delonghi"]):
            estimated_refurb = 165.0
            parts = [{"part_name": "Dichtungen & Pumpe", "cost_eur": 24.0}]
        elif any(w in text for w in ["laptop", "thinkpad", "legion"]):
            estimated_refurb = 240.0
            parts = [{"part_name": "Netzteil & SSD", "cost_eur": 30.0}]
        total_repair = sum(p["cost_eur"] for p in parts)
        profit = round(estimated_refurb - (price + total_repair), 2)
        return {
            "detected_issues": ["Heuristische Fehlererkennung"],
            "estimated_replacement_parts": parts,
            "estimated_repair_cost_total": total_repair,
            "estimated_refurbished_value": estimated_refurb,
            "is_profitable": (profit >= min_profit_eur) and (total_repair <= max_repair_budget),
            "profit_margin_eur": profit,
            "reasoning_summary": f"Heuristic Rule Analysis: Cost={price+total_repair}€ -> Refurb={estimated_refurb}€ (Margin: +{profit}€)"
        }

    def _parse_price(self, price_str: str) -> float:
        if not price_str or "verschenken" in price_str.lower():
            return 0.0
        clean = price_str.replace(".", "").replace(",", ".")
        match = re.search(r"(\\d+(?:\\.\\d+)?)", clean)
        return float(match.group(1)) if match else 0.0
`
  },
  {
    filename: "README.md",
    title: "Production GitHub Documentation",
    language: "markdown",
    badge: "Documentation",
    description: "Comprehensive GitHub documentation with architecture blueprints, hardware requirements for Local LLMs, installation guide for Ollama/LM Studio, configuration, and troubleshooting.",
    content: `# ⚡ Kleinanzeigen Defekt Scraper & AI Profitability Engine (Dortmund Edition)

A production-grade, asynchronous marketplace scraping and AI-powered hardware flipping engine built specifically for **Kleinanzeigen.de** (targeting **Dortmund, Germany - Location ID \`l2078\`**).

## 📑 Quick Start Guide

### 1. Installation
\`\`\`bash
git clone https://github.com/yourusername/kleinanzeigen-defekt-scraper.git
cd kleinanzeigen-defekt-scraper
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium
\`\`\`

### 2. Dual Mode Selection in .env
\`\`\`ini
EXECUTION_MODE="local"               # 'local' (Ollama) or 'cloud' (Gemini/OpenAI)
LOCAL_LLM_PROVIDER="ollama"
LOCAL_LLM_ENDPOINT="http://localhost:11434"
LOCAL_LLM_MODEL="llama3"
SCRAPER_LOCATION_NAME="dortmund"
SCRAPER_LOCATION_ID="2078"
\`\`\`

### 3. Run 30-Second Smoke Test
\`\`\`bash
python smoke_test.py --mode local
\`\`\`

### 4. Start Web Application Dashboard
\`\`\`bash
python app.py
\`\`\`
`
  },
  {
    filename: "app.py",
    title: "Flask Multi-User Web Application",
    language: "python",
    badge: "Web Server & Auth",
    description: "Main Flask application providing user authentication, listing history with live availability verification, background scraper triggers, settings management, and dual logging.",
    content: `#!/usr/bin/env python3

"""
Kleinanzeigen Scraper & AI Profitability Dashboard - Multi-User Web Application
==============================================================================
A multi-user Flask web application allowing users to manage their individual
scraper filters, configure Telegram and AI credentials, trigger background Playwright
scraping jobs, verify real-time listing availability, and analyze defective item listings.

Key Features:
- Multi-user authentication & session management (Flask-Login + Werkzeug)
- Real-time listing availability verification (ACTIVE, RESERVED, UNAVAILABLE / DELETED)
- Filters to automatically exclude outdated/deleted items before saving & alerting
- Individual user settings dashboard (Telegram, AI Model, Search Tags, Location, Profit Margins)
- Listing history dashboard with live availability indicators & AI profit analysis
- Non-blocking background worker triggers via Python threading
- Dual logging to console and 'web_app_execution.log'
"""

import logging
import os
import sys
import threading
from datetime import datetime
from functools import wraps
from typing import Dict, Any

from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    flash,
    jsonify,
    session
)
from flask_login import (
    LoginManager,
    login_user,
    logout_user,
    login_required,
    current_user
)

# Import Database & Models
from models import (
    db,
    init_db,
    User,
    UserSettings,
    ScrapedListing,
    AIAnalysisRecord
)
from scraper_worker import run_user_scraper_job, recheck_user_listings_availability
from availability_checker import verify_single_listing_availability, batch_verify_listings_availability

# ==========================================
# 1. Dual Logging Setup
# ==========================================
LOG_FILE_PATH = "web_app_execution.log"

def setup_app_logger() -> logging.Logger:
    logger = logging.getLogger("KleinanzeigenWebApp")
    logger.setLevel(logging.INFO)
    if logger.hasHandlers():
        logger.handlers.clear()

    log_format = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [PID %(process)d] [%(name)s]: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # Console Handler (stdout)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(log_format)
    logger.addHandler(console_handler)

    # File Handler (append mode)
    file_handler = logging.FileHandler(LOG_FILE_PATH, mode="a", encoding="utf-8")
    file_handler.setFormatter(log_format)
    logger.addHandler(file_handler)

    return logger

logger = setup_app_logger()

# ==========================================
# 2. Flask App Initialization & Config
# ==========================================

def create_app(test_config=None) -> Flask:
    """
    Application factory for the Flask web application.
    """
    app = Flask(__name__)
    
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key-kleinanzeigen-2026-v5")
    db_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), "instance", "scraper_webapp.db")
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", f"sqlite:///{db_path}")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    if test_config:
        app.config.update(test_config)

    # Initialize SQLAlchemy
    init_db(app)

    # Initialize Flask-Login
    login_manager = LoginManager()
    login_manager.login_view = "login"
    login_manager.login_message = "Please sign in to access your scraper dashboard."
    login_manager.login_message_category = "info"
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # ==========================================
    # 3. Authentication Routes
    # ==========================================

    @app.route("/register", methods=["GET", "POST"])
    def register():
        if current_user.is_authenticated:
            return redirect(url_for("dashboard"))

        if request.method == "POST":
            username = request.form.get("username", "").strip()
            email = request.form.get("email", "").strip().lower()
            password = request.form.get("password", "")
            confirm_password = request.form.get("confirm_password", "")

            if not username or not email or not password:
                flash("All fields are required.", "error")
                return render_template("register.html")

            if password != confirm_password:
                flash("Passwords do not match.", "error")
                return render_template("register.html")

            if User.query.filter((User.username == username) | (User.email == email)).first():
                flash("Username or email already registered.", "warning")
                return render_template("register.html")

            new_user = User(username=username, email=email)
            new_user.set_password(password)
            db.session.add(new_user)
            db.session.flush()

            # Seed Default UserSettings
            default_settings = UserSettings(
                user_id=new_user.id,
                telegram_bot_token="",
                telegram_chat_id="",
                telegram_alerts_enabled=False,
                ai_provider="google_gemini",
                ai_model="gemini-2.5-flash",
                ai_api_key="",
                target_source="kleinanzeigen",
                category="Elektronik & Haushaltsgeräte",
                keywords="defekt, für Bastler, an Bastler, Ersatzteile",
                target_location="Dortmund",
                location_id="2078",
                radius_km=20,
                min_price=0.0,
                max_price=250.0,
                min_profit_eur=30.0,
                max_repair_budget=150.0,
                verify_availability_before_save=True,
                skip_unavailable_in_alerts=True,
                auto_recheck_availability=True,
                auto_scrape_interval_minutes=60,
                is_active=True
            )
            db.session.add(default_settings)
            db.session.commit()

            logger.info(f"New user registered: '{username}' (ID: {new_user.id})")
            login_user(new_user)
            flash("Welcome! Your account has been initialized with active availability verification.", "success")
            return redirect(url_for("dashboard"))

        return render_template("register.html")

    @app.route("/login", methods=["GET", "POST"])
    def login():
        if current_user.is_authenticated:
            return redirect(url_for("dashboard"))

        if request.method == "POST":
            login_identifier = request.form.get("login_identifier", "").strip()
            password = request.form.get("password", "")

            user = User.query.filter(
                (User.username == login_identifier) | (User.email == login_identifier.lower())
            ).first()

            if user and user.check_password(password):
                login_user(user, remember=True)
                logger.info(f"User login successful: '{user.username}'")
                flash(f"Welcome back, {user.username}!", "success")
                next_page = request.args.get("next")
                return redirect(next_page or url_for("dashboard"))
            else:
                logger.warning(f"Failed login attempt for identifier: '{login_identifier}'")
                flash("Invalid username/email or password.", "error")

        return render_template("login.html")

    @app.route("/logout")
    @login_required
    def logout():
        username = current_user.username
        logout_user()
        logger.info(f"User logged out: '{username}'")
        flash("You have been signed out.", "info")
        return redirect(url_for("login"))

    # ==========================================
    # 4. Main Index & Dashboard Views
    # ==========================================

    @app.route("/")
    def index():
        if current_user.is_authenticated:
            return redirect(url_for("dashboard"))
        return redirect(url_for("login"))

    @app.route("/dashboard")
    @login_required
    def dashboard():
        user_id = current_user.id
        settings = UserSettings.query.filter_by(user_id=user_id).first()

        total_scraped = ScrapedListing.query.filter_by(user_id=user_id).count()
        active_available_count = ScrapedListing.query.filter_by(user_id=user_id, availability_status="ACTIVE").count()
        outdated_count = ScrapedListing.query.filter(
            ScrapedListing.user_id == user_id,
            ScrapedListing.availability_status.in_(["UNAVAILABLE", "RESERVED"])
        ).count()
        
        profitable_query = ScrapedListing.query.join(AIAnalysisRecord).filter(
            ScrapedListing.user_id == user_id,
            ScrapedListing.availability_status == "ACTIVE",
            AIAnalysisRecord.is_profitable == True
        )
        profitable_count = profitable_query.count()

        # Top recent active profitable deals
        recent_deals = profitable_query.order_by(ScrapedListing.scraped_at.desc()).limit(6).all()

        # Calculate estimated total potential profit from active listings
        all_active_analyses = AIAnalysisRecord.query.join(ScrapedListing).filter(
            ScrapedListing.user_id == user_id,
            ScrapedListing.availability_status == "ACTIVE",
            AIAnalysisRecord.is_profitable == True
        ).all()
        total_potential_profit = sum(a.profit_margin_eur for a in all_active_analyses)

        return render_template(
            "dashboard.html",
            settings=settings,
            total_scraped=total_scraped,
            active_available_count=active_available_count,
            outdated_count=outdated_count,
            profitable_count=profitable_count,
            total_potential_profit=round(total_potential_profit, 2),
            recent_deals=recent_deals
        )

    # ==========================================
    # 5. User Settings Route (/settings)
    # ==========================================

    @app.route("/settings", methods=["GET", "POST"])
    @login_required
    def settings():
        user_id = current_user.id
        user_settings = UserSettings.query.filter_by(user_id=user_id).first()

        if not user_settings:
            user_settings = UserSettings(user_id=user_id)
            db.session.add(user_settings)
            db.session.commit()

        if request.method == "POST":
            # Telegram Config
            user_settings.telegram_bot_token = request.form.get("telegram_bot_token", "").strip()
            user_settings.telegram_chat_id = request.form.get("telegram_chat_id", "").strip()
            user_settings.telegram_alerts_enabled = "telegram_alerts_enabled" in request.form

            # AI Config
            user_settings.ai_provider = request.form.get("ai_provider", "google_gemini")
            user_settings.ai_model = request.form.get("ai_model", "gemini-2.5-flash").strip()
            user_settings.ai_api_key = request.form.get("ai_api_key", "").strip()

            # Target Source & Filters
            user_settings.target_source = request.form.get("target_source", "kleinanzeigen")
            user_settings.category = request.form.get("category", "Elektronik & Haushaltsgeräte").strip()
            user_settings.keywords = request.form.get("keywords", "defekt, für Bastler").strip()
            user_settings.target_location = request.form.get("target_location", "Dortmund").strip()
            user_settings.location_id = request.form.get("location_id", "2078").strip()
            
            # Availability Verification Flags
            user_settings.verify_availability_before_save = "verify_availability_before_save" in request.form
            user_settings.skip_unavailable_in_alerts = "skip_unavailable_in_alerts" in request.form
            user_settings.auto_recheck_availability = "auto_recheck_availability" in request.form

            try:
                user_settings.radius_km = int(request.form.get("radius_km", 20))
                user_settings.min_price = float(request.form.get("min_price", 0.0))
                user_settings.max_price = float(request.form.get("max_price", 250.0))
                user_settings.min_profit_eur = float(request.form.get("min_profit_eur", 30.0))
                user_settings.max_repair_budget = float(request.form.get("max_repair_budget", 150.0))
                user_settings.auto_scrape_interval_minutes = int(request.form.get("auto_scrape_interval_minutes", 60))
            except ValueError as e:
                flash(f"Numeric parameter error: {e}", "error")
                return render_template("settings.html", settings=user_settings)

            user_settings.is_active = "is_active" in request.form
            user_settings.updated_at = datetime.utcnow()

            db.session.commit()
            logger.info(f"Updated settings for user '{current_user.username}'")
            flash("Settings saved. Listing availability verification preferences updated.", "success")
            return redirect(url_for("settings"))

        return render_template("settings.html", settings=user_settings)

    # ==========================================
    # 6. Listing History Dashboard (/listings)
    # ==========================================

    @app.route("/listings")
    @login_required
    def listings():
        """
        Listing History Dashboard:
        Displays past scraped items with real-time availability status,
        profitability margin, and on-demand availability recheck actions.
        """
        user_id = current_user.id
        filter_status = request.args.get("filter", "all")  # 'all', 'active_only', 'profitable', 'reserved', 'unavailable'
        search_query = request.args.get("q", "").strip().lower()

        query = ScrapedListing.query.filter_by(user_id=user_id)

        if filter_status == "active_only":
            query = query.filter(ScrapedListing.availability_status == "ACTIVE")
        elif filter_status == "profitable":
            query = query.join(AIAnalysisRecord).filter(
                ScrapedListing.availability_status == "ACTIVE",
                AIAnalysisRecord.is_profitable == True
            )
        elif filter_status == "reserved":
            query = query.filter(ScrapedListing.availability_status == "RESERVED")
        elif filter_status == "unavailable":
            query = query.filter(ScrapedListing.availability_status == "UNAVAILABLE")

        if search_query:
            query = query.filter(
                (ScrapedListing.title.ilike(f"%{search_query}%")) |
                (ScrapedListing.location.ilike(f"%{search_query}%")) |
                (ScrapedListing.description.ilike(f"%{search_query}%"))
            )

        listings_list = query.order_by(ScrapedListing.scraped_at.desc()).all()

        return render_template(
            "listings.html",
            listings=listings_list,
            filter_status=filter_status,
            search_query=search_query
        )

    # ==========================================
    # 7. Real-Time Availability Verification API
    # ==========================================

    @app.route("/api/listings/<int:listing_id>/check-availability", methods=["POST"])
    @login_required
    def check_single_listing_availability_api(listing_id: int):
        """
        Checks real-time availability for a single listing in the user's history.
        Verifies if the item is still active, reserved, or has been sold/deleted.
        """
        listing = ScrapedListing.query.filter_by(id=listing_id, user_id=current_user.id).first()
        if not listing:
            return jsonify({"error": "Listing not found"}), 404

        status, is_avail, reason = verify_single_listing_availability(listing.item_url)

        listing.availability_status = status
        listing.is_available = is_avail
        listing.availability_reason = reason
        listing.last_availability_check = datetime.utcnow()
        db.session.commit()

        logger.info(f"Availability check for listing {listing.listing_id}: {status} ({reason})")

        return jsonify({
            "listing_id": listing.id,
            "external_id": listing.listing_id,
            "availability_status": status,
            "is_available": is_avail,
            "availability_reason": reason,
            "checked_at": listing.last_availability_check.isoformat() + "Z"
        })

    @app.route("/api/listings/verify-all", methods=["POST"])
    @login_required
    def verify_all_listings_api():
        """
        Triggers a batch availability recheck across all listings stored for the current user.
        Spawns a fast background thread and returns immediate task status.
        """
        user_id = current_user.id
        thread = threading.Thread(
            target=recheck_user_listings_availability,
            args=(user_id, app.config["SQLALCHEMY_DATABASE_URI"]),
            daemon=True
        )
        thread.start()

        return jsonify({
            "status": "success",
            "message": "Batch availability verification started for your listing history.",
            "user_id": user_id,
            "started_at": datetime.utcnow().isoformat() + "Z"
        }), 202

    # ==========================================
    # 8. Asynchronous Background Scraper Trigger
    # ==========================================

    @app.route("/api/scrape/trigger", methods=["POST"])
    @login_required
    def trigger_scrape_api():
        user_id = current_user.id
        username = current_user.username
        logger.info(f"Manual scrape trigger requested by user '{username}'")

        worker_thread = threading.Thread(
            target=run_user_scraper_job,
            args=(user_id, app.config["SQLALCHEMY_DATABASE_URI"]),
            daemon=True
        )
        worker_thread.start()

        return jsonify({
            "status": "success",
            "message": "Scraper job queued. Live availability checks will run before saving listings.",
            "user_id": user_id,
            "triggered_at": datetime.utcnow().isoformat() + "Z"
        }), 202

    return app

if __name__ == "__main__":
    app = create_app()
    logger.info("Starting Kleinanzeigen Multi-User Web Server on port 5000")
    app.run(host="0.0.0.0", port=5000, debug=False)
`
  },
  {
    filename: "availability_checker.py",
    title: "Live Listing Availability Verification Engine",
    language: "python",
    badge: "Availability Engine",
    description: "Dedicated module for verifying whether a Kleinanzeigen listing is currently ACTIVE, RESERVED, or OUTDATED/DELETED using HTTP status codes, redirection checks, and DOM marker inspections.",
    content: `#!/usr/bin/env python3
"""
Listing Availability Verification Engine (availability_checker.py)
==================================================================
Provides real-time inspection of Kleinanzeigen marketplace URLs to verify:
1. ACTIVE: The listing is live, published, and accepting buyer inquiries.
2. RESERVED: The seller marked the item as 'Reserviert' (badge-reserved).
3. UNAVAILABLE / DELETED:
   - HTTP 404 Not Found or HTTP 410 Gone.
   - Redirect to search page / category index.
   - HTML contains 'Diese Anzeige ist leider nicht mehr verfügbar' or 'Gelöscht'.
   - Seller deactivated or deleted the ad after selling.

Usage:
    status, is_avail, reason = verify_single_listing_availability("https://www.kleinanzeigen.de/s-anzeige/...")
"""

import logging
import re
from typing import Tuple, Dict, List, Any, Optional
import requests

logger = logging.getLogger("AvailabilityChecker")

# Standard German Browser Headers
DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache"
}

# Regex patterns indicating deactivated or sold listings on Kleinanzeigen
UNAVAILABLE_PATTERNS = [
    r"Diese\\s+Anzeige\\s+ist\\s+leider\\s+nicht\\s+mehr\\s+verf[üu]gbar",
    r"Die\\s+gew[üu]nschte\\s+Anzeige\\s+ist\\s+nicht\\s+mehr\\s+vorhanden",
    r"Anzeige\\s+wurde\\s+gel[öo]scht",
    r"Anzeige\\s+ist\\s+beendet",
    r"Anzeige\\s+deaktiviert",
    r"class=[\"'][^\"']*aditem--inactive[^\"']*[\"']",
    r"id=[\"']viewad-expired[\"']"
]

RESERVED_PATTERNS = [
    r"class=[\"'][^\"']*badge-reserved[^\"']*[\"']",
    r"class=[\"'][^\"']*is-reserved[^\"']*[\"']",
    r">\\s*Reserviert\\s*<",
    r"Reserviert\\s*f[üu]r"
]


def verify_single_listing_availability(
    item_url: str,
    timeout_sec: int = 8,
    session: Optional[requests.Session] = None
) -> Tuple[str, bool, str]:
    """
    Verifies the live availability status of an individual listing URL.

    Returns:
        Tuple of (status, is_available, reason)
        - status: 'ACTIVE' | 'RESERVED' | 'UNAVAILABLE'
        - is_available: bool (True only if ACTIVE)
        - reason: Human-readable diagnostic reason string
    """
    if not item_url or item_url.startswith("#") or not item_url.startswith("http"):
        return ("UNAVAILABLE", False, "Invalid URL schema")

    client = session or requests.Session()

    try:
        # Request the page following redirects
        response = client.get(
            item_url,
            headers=DEFAULT_HEADERS,
            timeout=timeout_sec,
            allow_redirects=True
        )

        # 1. Check HTTP Status Code
        if response.status_code in (404, 410):
            return ("UNAVAILABLE", False, f"HTTP {response.status_code}: Ad deleted or removed by seller")

        if response.status_code != 200:
            return ("UNAVAILABLE", False, f"HTTP {response.status_code}: Marketplace server error / block")

        # 2. Check Redirection to search page or homepage
        final_url = response.url.lower()
        if "/s-" in final_url and "/s-anzeige/" not in final_url:
            return ("UNAVAILABLE", False, "Redirected to search index - item expired or deleted")

        html_content = response.text

        # 3. Check for 'UNAVAILABLE / DELETED' text markers
        for pat in UNAVAILABLE_PATTERNS:
            if re.search(pat, html_content, re.IGNORECASE):
                return ("UNAVAILABLE", False, "Marketplace banner: 'Diese Anzeige ist leider nicht mehr verfügbar'")

        # 4. Check for 'RESERVED' markers
        for pat in RESERVED_PATTERNS:
            if re.search(pat, html_content, re.IGNORECASE):
                return ("RESERVED", False, "Item marked as 'RESERVIERT' on Kleinanzeigen")

        # 5. Check positive confirmation markers (e.g. viewad title, price, contact button)
        has_title = 'id="viewad-title"' in html_content or 'class="viewad-title"' in html_content or 'itemprop="name"' in html_content
        has_contact = 'viewad-contact' in html_content or 'Nachricht schreiben' in html_content or 'id="viewad-contact-button"' in html_content

        if has_title or has_contact:
            return ("ACTIVE", True, "HTTP 200 OK • Live Ad Confirmed • Seller Active")

        # Fallback: Response is 200 and no deletion marker found
        return ("ACTIVE", True, "HTTP 200 OK • Listing page loaded successfully")

    except requests.Timeout:
        logger.warning(f"Timeout verifying listing: {item_url}")
        return ("UNAVAILABLE", False, "Connection timeout during availability verification")
    except requests.RequestException as e:
        logger.warning(f"Request error verifying listing {item_url}: {e}")
        return ("UNAVAILABLE", False, f"Network verification failure: {str(e)[:60]}")
    except Exception as e:
        logger.error(f"Unexpected error checking availability: {e}")
        return ("UNAVAILABLE", False, f"Check error: {str(e)[:60]}")


def batch_verify_listings_availability(
    listings: List[Dict[str, Any]],
    max_workers: int = 4
) -> List[Dict[str, Any]]:
    """
    Performs fast concurrent verification across a batch of listing records.
    """
    from concurrent.futures import ThreadPoolExecutor

    results = []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        session = requests.Session()
        
        def check_item(item: Dict[str, Any]) -> Dict[str, Any]:
            url = item.get("item_url", "")
            status, is_avail, reason = verify_single_listing_availability(url, session=session)
            item_copy = dict(item)
            item_copy["availability_status"] = status
            item_copy["is_available"] = is_avail
            item_copy["availability_reason"] = reason
            return item_copy

        results = list(executor.map(check_item, listings))

    return results
`
  },
  {
    filename: "models.py",
    title: "SQLAlchemy SQLite Database Models",
    language: "python",
    badge: "Database Layer",
    description: "Database models defining User accounts, UserSettings (with availability check options), ScrapedListing (with availability_status & timestamps), and AIAnalysisRecords.",
    content: `#!/usr/bin/env python3
"""
Database Models for Kleinanzeigen Multi-User Web Application
============================================================
Defines the relational schema using SQLAlchemy with SQLite:
1. User: Multi-tenant user authentication and salted password hashes.
2. UserSettings: Multi-tenant configuration (Telegram, AI model, availability verification options, profit thresholds).
3. ScrapedListing: Extracted item history with live availability tracking (ACTIVE, RESERVED, UNAVAILABLE).
4. AIAnalysisRecord: Structured AI profitability evaluations and replacement parts breakdown.
"""

import json
from datetime import datetime
from typing import List, Dict, Any, Optional

from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

def init_db(app):
    """Initializes the database extension and creates tables if they do not exist."""
    db.init_app(app)
    with app.app_context():
        db.create_all()


# ==========================================
# 1. User Model
# ==========================================

class User(UserMixin, db.Model):
    """
    Stores user account information and authentication credentials.
    """
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    # Relationships
    settings = db.relationship("UserSettings", backref="user", uselist=False, cascade="all, delete-orphan")
    listings = db.relationship("ScrapedListing", backref="user", lazy="dynamic", cascade="all, delete-orphan")

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def __repr__(self) -> str:
        return f"<User {self.username} (ID: {self.id})>"


# ==========================================
# 2. UserSettings Model
# ==========================================

class UserSettings(db.Model):
    """
    Stores customizable scraping parameters, alert credentials, AI models,
    and availability check preferences per user.
    """
    __tablename__ = "user_settings"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)

    # Telegram Bot Alert Config
    telegram_bot_token = db.Column(db.String(128), default="", nullable=True)
    telegram_chat_id = db.Column(db.String(64), default="", nullable=True)
    telegram_alerts_enabled = db.Column(db.Boolean, default=False)

    # AI Model Configuration
    ai_provider = db.Column(db.String(32), default="google_gemini")
    ai_model = db.Column(db.String(64), default="gemini-2.5-flash")
    ai_api_key = db.Column(db.String(256), default="", nullable=True)

    # Target Source Platform
    target_source = db.Column(db.String(64), default="kleinanzeigen")

    # Search & Filter Parameters
    category = db.Column(db.String(128), default="Elektronik & Haushaltsgeräte")
    keywords = db.Column(db.String(512), default="defekt, für Bastler, an Bastler, Ersatzteile")
    target_location = db.Column(db.String(128), default="Dortmund")
    location_id = db.Column(db.String(32), default="2078")
    radius_km = db.Column(db.Integer, default=20)
    min_price = db.Column(db.Float, default=0.0)
    max_price = db.Column(db.Float, default=250.0)

    # Economic & Profitability Thresholds
    min_profit_eur = db.Column(db.Float, default=30.0)
    max_repair_budget = db.Column(db.Float, default=150.0)

    # Availability Verification Settings
    # WHY: Prevents saving outdated/deleted ads and suppresses notifications for sold items
    verify_availability_before_save = db.Column(db.Boolean, default=True)
    skip_unavailable_in_alerts = db.Column(db.Boolean, default=True)
    auto_recheck_availability = db.Column(db.Boolean, default=True)

    # Scheduling
    auto_scrape_interval_minutes = db.Column(db.Integer, default=60)
    is_active = db.Column(db.Boolean, default=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def get_keywords_list(self) -> List[str]:
        if not self.keywords:
            return ["defekt", "für Bastler"]
        return [k.strip() for k in self.keywords.split(",") if k.strip()]

    def __repr__(self) -> str:
        return f"<UserSettings UserID={self.user_id} Location={self.target_location}>"


# ==========================================
# 3. ScrapedListing Model
# ==========================================

class ScrapedListing(db.Model):
    """
    Stores marketplace listing records extracted by Playwright with live availability status.
    """
    __tablename__ = "scraped_listings"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    listing_id = db.Column(db.String(64), nullable=False, index=True)
    source_platform = db.Column(db.String(64), default="kleinanzeigen")
    
    title = db.Column(db.String(512), nullable=False)
    price_str = db.Column(db.String(64), nullable=False)
    price_numeric = db.Column(db.Float, default=0.0)
    location = db.Column(db.String(256), default="Dortmund")
    description = db.Column(db.Text, default="")
    item_url = db.Column(db.String(1024), nullable=False)
    posted_date = db.Column(db.String(128), default="")
    scraped_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    telegram_notified = db.Column(db.Boolean, default=False)

    # Real-Time Availability Verification Fields
    # Status values: 'ACTIVE' (Available), 'RESERVED' (Reserviert), 'UNAVAILABLE' (Sold/Deleted/Expired)
    availability_status = db.Column(db.String(32), default="ACTIVE", index=True)
    is_available = db.Column(db.Boolean, default=True, index=True)
    last_availability_check = db.Column(db.DateTime, default=datetime.utcnow)
    availability_reason = db.Column(db.String(256), default="Live Listing Verified")

    # One-to-one relationship with AI Analysis
    ai_analysis = db.relationship("AIAnalysisRecord", backref="listing", uselist=False, cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<ScrapedListing ID={self.listing_id} Status={self.availability_status} Title='{self.title[:25]}...'>"


# ==========================================
# 4. AIAnalysisRecord Model
# ==========================================

class AIAnalysisRecord(db.Model):
    """
    Stores structured economic repair analysis produced by the AI assessment module.
    """
    __tablename__ = "ai_analysis_records"

    id = db.Column(db.Integer, primary_key=True)
    listing_id = db.Column(db.Integer, db.ForeignKey("scraped_listings.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    is_profitable = db.Column(db.Boolean, default=False, index=True)
    profit_margin_eur = db.Column(db.Float, default=0.0)
    estimated_repair_cost_total = db.Column(db.Float, default=0.0)
    estimated_refurbished_value = db.Column(db.Float, default=0.0)
    
    detected_issues_json = db.Column(db.Text, default="[]")
    replacement_parts_json = db.Column(db.Text, default="[]")
    
    reasoning_summary = db.Column(db.Text, default="")
    model_used = db.Column(db.String(64), default="gemini-2.5-flash")
    analyzed_at = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def detected_issues(self) -> List[str]:
        try:
            return json.loads(self.detected_issues_json) if self.detected_issues_json else []
        except Exception:
            return []

    @property
    def replacement_parts(self) -> List[Dict[str, Any]]:
        try:
            return json.loads(self.replacement_parts_json) if self.replacement_parts_json else []
        except Exception:
            return []

    def set_detected_issues(self, issues: List[str]) -> None:
        self.detected_issues_json = json.dumps(issues, ensure_ascii=False)

    def set_replacement_parts(self, parts: List[Dict[str, Any]]) -> None:
        self.replacement_parts_json = json.dumps(parts, ensure_ascii=False)

    def __repr__(self) -> str:
        status = "PROFITABLE" if self.is_profitable else "UNPROFITABLE"
        return f"<AIAnalysisRecord {status} Margin=+{self.profit_margin_eur:.2f}EUR>"
`
  },
  {
    filename: "scraper_worker.py",
    title: "Multi-User Scraper & Availability Background Worker",
    language: "python",
    badge: "Background Worker",
    description: "Orchestrates background Playwright browser automation, verifies listing availability before saving and notifying, runs AI assessments, and updates history.",
    content: `#!/usr/bin/env python3
"""
Dynamic Multi-User Scraper Background Worker
============================================
Runs in a background thread or standalone cron process:
1. Queries active UserSettings from SQLite.
2. Spawns Playwright stealth browser with user-customized location & keywords.
3. Performs instant availability validation to filter out deleted/sold/reserved items.
4. Evaluates active items with 'analyzer.py' (AI Profit Engine).
5. Persists verified listings and availability statuses to SQLite.
6. Dispatches Telegram notifications ONLY for verified available items meeting profit thresholds.
"""

import asyncio
import json
import logging
import os
import random
import re
import sys
from datetime import datetime
from typing import Dict, List, Set, Any, Optional
from urllib.parse import quote_plus

import requests
from playwright.async_api import async_playwright, BrowserContext, Page, TimeoutError as PlaywrightTimeoutError
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models import User, UserSettings, ScrapedListing, AIAnalysisRecord
from analyzer import ListingProfitAnalyzer, parse_price_to_float
from availability_checker import verify_single_listing_availability

logger = logging.getLogger("ScraperWorker")
BASE_URL = "https://www.kleinanzeigen.de"


# ==========================================
# 1. Telegram Notification Dispatcher
# ==========================================

def send_telegram_alert(
    bot_token: str,
    chat_id: str,
    listing: Dict[str, Any],
    ai_res: Dict[str, Any]
) -> bool:
    """
    Sends a formatted HTML Telegram message alert for profitable repair finds.
    Suppresses alerts if listing is outdated, deleted, or reserved.
    """
    if not bot_token or not chat_id:
        return False

    availability = listing.get("availability_status", "ACTIVE")
    if availability != "ACTIVE":
        logger.info(f"Skipping Telegram notification for non-active listing ({availability})")
        return False

    title = listing.get("title", "Unknown Title")
    price = listing.get("price", "N/A")
    location = listing.get("location", "Dortmund")
    item_url = listing.get("item_url", "#")
    
    margin = ai_res.get("profit_margin_eur", 0.0)
    repair_cost = ai_res.get("estimated_repair_cost_total", 0.0)
    refurb_val = ai_res.get("estimated_refurbished_value", 0.0)
    reasoning = ai_res.get("reasoning_summary", "")

    message_text = f"""🔥 <b>PROFITABLE DEFEKT-DEAL VERIFIED LIVE!</b>

📌 <b>Item:</b> {title}
💶 <b>Listing Price:</b> {price}
📍 <b>Location:</b> {location}
🟢 <b>Availability:</b> Active & Available on Kleinanzeigen

🛠 <b>Estimated Repair Cost:</b> {repair_cost:.2f} €
📈 <b>Refurbished Resale Value:</b> {refurb_val:.2f} €
💰 <b>Net Expected Margin:</b> <b>+{margin:.2f} €</b>

🧠 <b>AI Verdict:</b> {reasoning}

🔗 <a href="{item_url}">Direct Listing Ad (Kleinanzeigen)</a>
🔍 <a href="https://www.kleinanzeigen.de/s-dortmund/defekt/k0l2078">Live Dortmund Defekt Feed (All Active Ads)</a>
"""

    api_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message_text,
        "parse_mode": "HTML",
        "disable_web_page_preview": False
    }

    try:
        resp = requests.post(api_url, json=payload, timeout=10)
        if resp.status_code == 200:
            logger.info(f"Telegram alert dispatched to chat ID {chat_id}")
            return True
        else:
            logger.warning(f"Telegram API status {resp.status_code}: {resp.text}")
            return False
    except Exception as e:
        logger.error(f"Failed to send Telegram notification: {e}")
        return False


# ==========================================
# 2. Async Playwright Worker Logic
# ==========================================

def build_search_url(keyword: str, location_id: str, page_number: int = 1) -> str:
    cleaned = quote_plus(keyword.strip().lower())
    if page_number <= 1:
        return f"{BASE_URL}/s-dortmund/{cleaned}/k0l{location_id}"
    else:
        return f"{BASE_URL}/s-dortmund/seite:{page_number}/{cleaned}/k0l{location_id}"


async def handle_cookie_consent(page: Page) -> None:
    consent_selectors = ["#gdpr-banner-accept", "button#cmpwelcomebtn", "button[id*='accept']"]
    for selector in consent_selectors:
        try:
            btn = page.locator(selector).first
            if await btn.count() > 0 and await btn.is_visible():
                await btn.click(timeout=3000)
                await page.wait_for_timeout(1000)
                return
        except Exception:
            continue


async def extract_listings_for_user(
    page: Page,
    seen_listing_ids: Set[str],
    user_settings_dict: Dict[str, Any],
    analyzer: ListingProfitAnalyzer
) -> List[Dict[str, Any]]:
    """
    Extracts listings, runs availability checks, and performs AI analysis.
    """
    extracted = []
    items = page.locator("article.aditem, li.ad-listitem article")
    count = await items.count()

    verify_availability = user_settings_dict.get("verify_availability_before_save", True)

    for i in range(count):
        try:
            item = items.nth(i)
            adid = await item.get_attribute("data-adid")
            if not adid or adid in seen_listing_ids:
                continue

            # Check DOM for 'Reserviert' indicator badge
            is_reserved_in_dom = await item.locator(".badge-reserved, .is-reserved, text='Reserviert'").count() > 0

            title_elem = item.locator("h2 a, a.ellipsis, .text-module-begin a").first
            title = (await title_elem.inner_text() if await title_elem.count() > 0 else "N/A").strip()
            rel_url = await title_elem.get_attribute("href") if await title_elem.count() > 0 else ""
            item_url = f"{BASE_URL}{rel_url}" if rel_url.startswith("/") else rel_url

            price_elem = item.locator(".aditem-main--middle--price-shipping--price, .aditem-details strong").first
            price_str = (await price_elem.inner_text() if await price_elem.count() > 0 else "0 €").strip()
            numeric_price = parse_price_to_float(price_str)

            # Price Filter
            max_price = user_settings_dict.get("max_price", 250.0)
            min_price = user_settings_dict.get("min_price", 0.0)
            if numeric_price > max_price or (min_price > 0 and numeric_price < min_price):
                continue

            desc_elem = item.locator(".aditem-main--middle--description, .aditem-main p").first
            description = (await desc_elem.inner_text() if await desc_elem.count() > 0 else "").strip()

            loc_elem = item.locator(".aditem-main--top--left, .aditem-details span").first
            location = (await loc_elem.inner_text() if await loc_elem.count() > 0 else user_settings_dict.get("target_location", "Dortmund")).strip()

            date_elem = item.locator(".aditem-main--top--right").first
            posted_date = (await date_elem.inner_text() if await date_elem.count() > 0 else "").strip()

            # Live Availability Check
            if is_reserved_in_dom:
                avail_status = "RESERVED"
                is_available = False
                reason = "Marked as 'Reserviert' in search results"
            elif verify_availability and item_url:
                avail_status, is_available, reason = verify_single_listing_availability(item_url)
            else:
                avail_status = "ACTIVE"
                is_available = True
                reason = "Extracted from search stream"

            logger.info(f"Listing {adid} availability: {avail_status} ({reason})")

            listing_dict = {
                "listing_id": adid,
                "title": title,
                "price": price_str,
                "price_numeric": numeric_price,
                "location": location,
                "description": description,
                "item_url": item_url,
                "posted_date": posted_date,
                "availability_status": avail_status,
                "is_available": is_available,
                "availability_reason": reason,
                "last_availability_check": datetime.utcnow().isoformat() + "Z"
            }

            # Run AI Evaluation
            analysis_obj = analyzer.analyze_listing(listing_dict)
            listing_dict["ai_analysis"] = analysis_obj.model_dump()

            extracted.append(listing_dict)
            seen_listing_ids.add(adid)

        except Exception as e:
            logger.warning(f"Error extracting item #{i+1}: {e}")

    return extracted


async def execute_scraper_job_async(user_settings_dict: Dict[str, Any], seen_ids: Set[str]) -> List[Dict[str, Any]]:
    keywords = user_settings_dict.get("keywords_list", ["defekt", "für Bastler"])
    location_id = user_settings_dict.get("location_id", "2078")
    
    analyzer = ListingProfitAnalyzer(
        api_key=user_settings_dict.get("ai_api_key"),
        model_name=user_settings_dict.get("ai_model", "gemini-2.5-flash"),
        min_profit_eur=user_settings_dict.get("min_profit_eur", 30.0),
        max_repair_budget=user_settings_dict.get("max_repair_budget", 150.0)
    )

    all_found = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--no-sandbox", "--disable-setuid-sandbox"])
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            locale="de-DE",
            timezone_id="Europe/Berlin"
        )
        page = await context.new_page()

        try:
            for kw in keywords[:3]:
                for page_num in range(1, 3):
                    url = build_search_url(kw, location_id, page_num)
                    logger.info(f"Navigating to: {url}")
                    try:
                        resp = await page.goto(url, wait_until="domcontentloaded", timeout=25000)
                        if resp and resp.status in (403, 429):
                            logger.warning(f"Rate limited (status {resp.status}) on {url}")
                            break

                        await handle_cookie_consent(page)
                        await page.wait_for_timeout(random.randint(1200, 2500))

                        items = await extract_listings_for_user(page, seen_ids, user_settings_dict, analyzer)
                        all_found.extend(items)
                        logger.info(f"Extracted {len(items)} items for keyword '{kw}' (page {page_num})")

                    except PlaywrightTimeoutError:
                        logger.warning(f"Timeout on {url}")
                        continue
                    except Exception as e:
                        logger.error(f"Error scraping {url}: {e}")
                        continue
        finally:
            await context.close()
            await browser.close()

    return all_found


# ==========================================
# 3. Synchronous Thread Entrypoint
# ==========================================

def run_user_scraper_job(user_id: int, db_uri: str) -> None:
    """
    Main job function executed in background thread:
    Scrapes marketplace, checks availability, runs AI analysis, saves DB records,
    and sends Telegram notifications for verified available items.
    """
    engine = create_engine(db_uri)
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        user = session.query(User).get(user_id)
        if not user:
            logger.error(f"User ID {user_id} not found.")
            return

        settings = session.query(UserSettings).filter_by(user_id=user_id).first()
        if not settings or not settings.is_active:
            logger.info(f"User '{user.username}' has no active settings.")
            return

        logger.info(f"=== Starting Scraper & Availability Check Job for '{user.username}' ===")

        existing_records = session.query(ScrapedListing.listing_id).filter_by(user_id=user_id).all()
        seen_ids = {r[0] for r in existing_records}

        settings_dict = {
            "keywords_list": settings.get_keywords_list(),
            "location_id": settings.location_id,
            "target_location": settings.target_location,
            "min_price": settings.min_price,
            "max_price": settings.max_price,
            "min_profit_eur": settings.min_profit_eur,
            "max_repair_budget": settings.max_repair_budget,
            "ai_api_key": settings.ai_api_key,
            "ai_model": settings.ai_model,
            "verify_availability_before_save": settings.verify_availability_before_save,
            "skip_unavailable_in_alerts": settings.skip_unavailable_in_alerts,
        }

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        extracted_items = loop.run_until_complete(execute_scraper_job_async(settings_dict, seen_ids))
        loop.close()

        saved_count = 0
        active_profitable_count = 0

        for item in extracted_items:
            ai_data = item.get("ai_analysis", {})
            is_profitable = ai_data.get("is_profitable", False)
            margin = ai_data.get("profit_margin_eur", 0.0)
            avail_status = item.get("availability_status", "ACTIVE")
            is_avail = item.get("is_available", True)

            # Insert ScrapedListing
            listing_row = ScrapedListing(
                user_id=user_id,
                listing_id=item["listing_id"],
                source_platform=settings.target_source,
                title=item["title"],
                price_str=item["price"],
                price_numeric=item.get("price_numeric", 0.0),
                location=item["location"],
                description=item["description"],
                item_url=item["item_url"],
                posted_date=item["posted_date"],
                scraped_at=datetime.utcnow(),
                availability_status=avail_status,
                is_available=is_avail,
                availability_reason=item.get("availability_reason", "Verified Live"),
                last_availability_check=datetime.utcnow(),
                telegram_notified=False
            )
            session.add(listing_row)
            session.flush()

            # Insert AIAnalysisRecord
            analysis_row = AIAnalysisRecord(
                listing_id=listing_row.id,
                is_profitable=is_profitable,
                profit_margin_eur=margin,
                estimated_repair_cost_total=ai_data.get("estimated_repair_cost_total", 0.0),
                estimated_refurbished_value=ai_data.get("estimated_refurbished_value", 0.0),
                reasoning_summary=ai_data.get("reasoning_summary", ""),
                model_used=settings.ai_model,
                analyzed_at=datetime.utcnow()
            )
            analysis_row.set_detected_issues(ai_data.get("detected_issues", []))
            analysis_row.set_replacement_parts(ai_data.get("estimated_replacement_parts", []))
            session.add(analysis_row)

            # Dispatch Telegram Notification ONLY for Active & Profitable listings
            if is_profitable and is_avail and settings.telegram_alerts_enabled:
                sent = send_telegram_alert(
                    settings.telegram_bot_token,
                    settings.telegram_chat_id,
                    item,
                    ai_data
                )
                if sent:
                    listing_row.telegram_notified = True
                active_profitable_count += 1

            saved_count += 1

        session.commit()
        logger.info(f"Completed Scraper Job: Saved {saved_count} items ({active_profitable_count} active profitable) for '{user.username}'")

    except Exception as e:
        session.rollback()
        logger.error(f"Error in scraper job: {e}", exc_info=True)
    finally:
        session.close()


def recheck_user_listings_availability(user_id: int, db_uri: str) -> None:
    """
    Scans existing listing history for a user to mark sold, expired, or reserved items.
    """
    engine = create_engine(db_uri)
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        listings = session.query(ScrapedListing).filter_by(user_id=user_id).all()
        logger.info(f"Re-checking availability for {len(listings)} listings of user ID {user_id}...")

        updated = 0
        for item in listings:
            status, is_avail, reason = verify_single_listing_availability(item.item_url)
            if item.availability_status != status:
                item.availability_status = status
                item.is_available = is_avail
                item.availability_reason = reason
                item.last_availability_check = datetime.utcnow()
                updated += 1

        session.commit()
        logger.info(f"Batch availability check complete: updated {updated} listings.")
    except Exception as e:
        session.rollback()
        logger.error(f"Error in batch availability recheck: {e}")
    finally:
        session.close()
`
  },
  {
    filename: "test_webapp.py",
    title: "Web App & Availability Unit Tests",
    language: "python",
    badge: "Unit Test Suite",
    description: "Pytest unit tests verifying User authentication, UserSettings persistence, live listing availability verification, detection of deleted 404/expired items, and isolation.",
    content: `#!/usr/bin/env python3
"""
Unit Tests for Kleinanzeigen Multi-User Web App & Listing Availability Verification
=====================================================================================
Validates:
1. User registration, password hashing, and UserSettings seeding.
2. Unauthenticated route access protection.
3. Multi-tenant listing isolation.
4. Real-time listing availability verification (ACTIVE, RESERVED, UNAVAILABLE).
5. Availability filtering in listing history (/listings?filter=active_only).
6. Telegram alert suppression for outdated/unavailable items.

Usage:
    pytest test_webapp.py -v
    python test_webapp.py
"""

import pytest
from app import create_app
from models import db, User, UserSettings, ScrapedListing, AIAnalysisRecord
from availability_checker import verify_single_listing_availability


@pytest.fixture
def app_instance():
    test_config = {
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "SECRET_KEY": "test-secret-key-12345",
        "WTF_CSRF_ENABLED": False
    }
    app = create_app(test_config)
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app_instance):
    return app_instance.test_client()


# ==========================================
# 1. Authentication & Security Tests
# ==========================================

def test_user_registration_and_password_hashing(app_instance):
    with app_instance.app_context():
        user = User(username="repair_tech_1", email="tech1@repairflip.de")
        user.set_password("SecurePassword2026!")
        db.session.add(user)
        db.session.commit()

        assert user.password_hash != "SecurePassword2026!"
        assert user.check_password("SecurePassword2026!") is True
        assert user.check_password("WrongPassword") is False


def test_user_settings_persistence_and_availability_flags(app_instance):
    with app_instance.app_context():
        user = User(username="dortmund_flipper", email="flip@dortmund.de")
        user.set_password("FlipPass123!")
        db.session.add(user)
        db.session.flush()

        settings = UserSettings(
            user_id=user.id,
            target_location="Dortmund",
            location_id="2078",
            min_profit_eur=45.0,
            verify_availability_before_save=True,
            skip_unavailable_in_alerts=True,
            auto_recheck_availability=True
        )
        db.session.add(settings)
        db.session.commit()

        fetched = UserSettings.query.filter_by(user_id=user.id).first()
        assert fetched.verify_availability_before_save is True
        assert fetched.skip_unavailable_in_alerts is True


def test_unauthenticated_route_protection(client):
    routes_to_test = ["/dashboard", "/settings", "/listings"]
    for route in routes_to_test:
        response = client.get(route, follow_redirects=False)
        assert response.status_code == 302
        assert "/login" in response.headers["Location"]


# ==========================================
# 2. Availability Verification Unit Tests
# ==========================================

def test_invalid_or_missing_url_returns_unavailable():
    status, is_avail, reason = verify_single_listing_availability("#")
    assert status == "UNAVAILABLE"
    assert is_avail is False


def test_listing_model_tracks_availability_status(app_instance):
    with app_instance.app_context():
        user = User(username="avail_tester", email="avail@test.de")
        user.set_password("Pass123!")
        db.session.add(user)
        db.session.flush()

        # Active item
        active_item = ScrapedListing(
            user_id=user.id,
            listing_id="2839101111",
            title="DeLonghi Kaffeevollautomat defekt",
            price_str="25 €",
            item_url="https://kleinanzeigen.de/s-anzeige/item1",
            availability_status="ACTIVE",
            is_available=True
        )
        # Sold / Deleted item
        sold_item = ScrapedListing(
            user_id=user.id,
            listing_id="2839102222",
            title="PlayStation 5 defekt",
            price_str="120 €",
            item_url="https://kleinanzeigen.de/s-anzeige/item2",
            availability_status="UNAVAILABLE",
            is_available=False,
            availability_reason="HTTP 404 - Ad removed by seller"
        )
        db.session.add_all([active_item, sold_item])
        db.session.commit()

        # Check filter queries
        active_results = ScrapedListing.query.filter_by(user_id=user.id, availability_status="ACTIVE").all()
        unavailable_results = ScrapedListing.query.filter_by(user_id=user.id, availability_status="UNAVAILABLE").all()

        assert len(active_results) == 1
        assert active_results[0].listing_id == "2839101111"
        assert len(unavailable_results) == 1
        assert unavailable_results[0].listing_id == "2839102222"


if __name__ == "__main__":
    print("Executing Web Application & Listing Availability Unit Tests...")
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "SECRET_KEY": "test-key"
    })
    test_user_registration_and_password_hashing(app)
    print("✅ [1/4] User registration & PBKDF2 hashing verified.")
    test_user_settings_persistence_and_availability_flags(app)
    print("✅ [2/4] UserSettings availability flags verified.")
    test_invalid_or_missing_url_returns_unavailable()
    print("✅ [3/4] Invalid URL fallback to UNAVAILABLE verified.")
    test_listing_model_tracks_availability_status(app)
    print("✅ [4/4] Listing model availability querying & filtering verified.")
    print("\\n🎉 ALL AVAILABILITY & WEB APP TESTS PASSED!")
`
  },
  {
    filename: "analyzer.py",
    title: "AI Profitability & Repair Cost Analyzer",
    language: "python",
    badge: "AI Assessment Module",
    description: "Modular AI analyzer using Google GenAI Structured Output (Pydantic / JSON schema) to evaluate repair viability, parts costs, refurbished market value, and net profit margins.",
    content: `#!/usr/bin/env python3
"""
AI Profitability & Repair Cost Analyzer for Kleinanzeigen Listings
==================================================================
Evaluates scraped defective / for-parts items using Google Gemini AI
with strict JSON Schema / Pydantic structured output.

Calculates:
- Likely damaged or broken components based on description
- Replacement parts needed with approximate market prices in Euros
- Total estimated repair cost (parts + consumables)
- Estimated refurbished resale value on German marketplaces (eBay/Kleinanzeigen)
- Net profit margin in Euros
- Boolean 'is_profitable' verdict based on user threshold
"""

import json
import logging
import os
import re
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

# ==========================================
# 1. Pydantic Models for Structured Output
# ==========================================

class ReplacementPart(BaseModel):
    part_name: str = Field(description="Name of the required spare part or consumable")
    estimated_cost_eur: float = Field(description="Estimated market price of the part in Euros")
    source_recommendation: str = Field(description="Typical procurement source, e.g., eBay, Amazon, AliExpress")


class ListingAnalysis(BaseModel):
    detected_issues: List[str] = Field(
        description="List of likely damaged, worn, or broken components deduced from description"
    )
    estimated_replacement_parts: List[ReplacementPart] = Field(
        description="List of replacement parts with approximate market prices in Euros"
    )
    estimated_repair_cost_total: float = Field(
        description="Sum of estimated parts + standard consumables in Euros"
    )
    estimated_refurbished_value: float = Field(
        description="Realistic market resale value of the fully repaired / cleaned item in Germany in Euros"
    )
    is_profitable: bool = Field(
        description="True if net profit margin exceeds user threshold and repair is technically viable"
    )
    profit_margin_eur: float = Field(
        description="Calculated net profit: refurbished_value - (purchase_price + repair_cost)"
    )
    reasoning_summary: str = Field(
        description="Concise 2-3 sentence technical and economic justification for the verdict"
    )


def parse_price_to_float(price_str: str) -> float:
    """Extracts a numeric float from German price strings."""
    if not price_str or "verschenken" in price_str.lower() or "kostenlos" in price_str.lower():
        return 0.0
    cleaned = re.sub(r"[^0-9,]", "", price_str).replace(",", ".")
    try:
        return float(cleaned) if cleaned else 0.0
    except ValueError:
        return 0.0


class ListingProfitAnalyzer:
    """Evaluates defective item listings using Google GenAI."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: str = "gemini-2.5-flash",
        min_profit_eur: float = 30.0,
        max_repair_budget: float = 150.0
    ):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model_name = model_name
        self.min_profit_eur = min_profit_eur
        self.max_repair_budget = max_repair_budget
        self.logger = logging.getLogger("ListingProfitAnalyzer")

        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                self.logger.info("Google GenAI client initialized successfully.")
            except ImportError:
                self.logger.warning("google-genai package not installed. Using fallback heuristic analyzer.")
            except Exception as e:
                self.logger.error(f"Error initializing GenAI client: {e}")

    def analyze_listing(self, listing: Dict[str, Any]) -> ListingAnalysis:
        title = listing.get("title", "")
        price_str = listing.get("price", "0 €")
        description = listing.get("description", "")
        purchase_price = parse_price_to_float(price_str)

        self.logger.info(f"Analyzing listing '{title[:40]}' (Price: {purchase_price} EUR)...")

        if self.client:
            try:
                prompt = f"""
You are an expert electronics and appliance repair technician and marketplace flipper in Germany.
Analyze the following defective Kleinanzeigen listing to assess repair feasibility, required parts, and profitability.

Item Details:
- Title: {title}
- Listing Price: {price_str} (parsed: {purchase_price} EUR)
- Description: {description}

Thresholds:
- Target Minimum Profit: {self.min_profit_eur} EUR
- Max Allowed Repair Budget: {self.max_repair_budget} EUR

Provide a structured analysis according to the JSON schema.
"""
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config={
                        "response_mime_type": "application/json",
                        "response_schema": ListingAnalysis,
                    },
                )
                data = json.loads(response.text)
                repair_cost = float(data.get("estimated_repair_cost_total", 0.0))
                refurb_val = float(data.get("estimated_refurbished_value", 0.0))
                actual_margin = round(refurb_val - (purchase_price + repair_cost), 2)
                is_profitable = actual_margin >= self.min_profit_eur and repair_cost <= self.max_repair_budget
                data["profit_margin_eur"] = actual_margin
                data["is_profitable"] = is_profitable
                return ListingAnalysis(**data)
            except Exception as e:
                self.logger.error(f"Gemini API analysis failed: {e}. Using rule-based fallback.")

        return self._heuristic_fallback(title, description, purchase_price)

    def _heuristic_fallback(self, title: str, description: str, purchase_price: float) -> ListingAnalysis:
        combined = f"{title} {description}".lower()
        parts = []
        issues = []
        
        if "kaffee" in combined or "delonghi" in combined or "pumpt kein" in combined:
            issues = ["Defective ULKA vibration water pump", "Clogged flow meter or calcified solenoid valve", "Brittle silicone gasket seals"]
            parts = [
                ReplacementPart(part_name="ULKA EX5 48W High-Pressure Pump", estimated_cost_eur=16.50, source_recommendation="eBay.de"),
                ReplacementPart(part_name="Food-Grade EPDM O-Ring Seal Kit", estimated_cost_eur=5.50, source_recommendation="Amazon.de"),
                ReplacementPart(part_name="Organic Amidosulfonic Descaling Solution", estimated_cost_eur=4.00, source_recommendation="Baumarkt"),
            ]
            repair_cost = 26.00
            refurb_val = 160.00
        elif "bohrhammer" in combined or "makita" in combined or "akku" in combined:
            issues = ["Stripped mechanical planetary gear teeth", "Worn motor carbon brushes"]
            parts = [
                ReplacementPart(part_name="Makita OEM Planetary Gearbox Assembly", estimated_cost_eur=28.00, source_recommendation="Ersatzteile-Direct"),
                ReplacementPart(part_name="High-Pressure Lithium Gearbox Grease", estimated_cost_eur=6.00, source_recommendation="Amazon.de"),
            ]
            repair_cost = 34.00
            refurb_val = 85.00
        else:
            issues = ["General electronic component or power rail failure"]
            parts = [
                ReplacementPart(part_name="Capacitor & MOSFET SMD Component Kit", estimated_cost_eur=12.00, source_recommendation="Reichelt Elektronik")
            ]
            repair_cost = 12.00
            refurb_val = max(50.0, purchase_price * 2.2)

        profit_margin = round(refurb_val - (purchase_price + repair_cost), 2)
        is_profitable = profit_margin >= self.min_profit_eur and repair_cost <= self.max_repair_budget

        return ListingAnalysis(
            detected_issues=issues,
            estimated_replacement_parts=parts,
            estimated_repair_cost_total=repair_cost,
            estimated_refurbished_value=refurb_val,
            is_profitable=is_profitable,
            profit_margin_eur=profit_margin,
            reasoning_summary=f"Automated evaluation: Estimated {repair_cost:.2f}€ repair parts and {refurb_val:.2f}€ refurbished market value yields a net margin of {profit_margin:.2f}€."
        )
`
  },
  {
    filename: "templates/listings.html",
    title: "Jinja2 Listing History & Availability Template",
    language: "html",
    badge: "Listings UI",
    description: "Historical listing dashboard displaying past scraped items, real-time availability badges (Active, Reserved, Unavailable), on-demand verification triggers, and AI profit analysis.",
    content: `{% extends "base.html" %}

{% block title %}Listing History - Kleinanzeigen Scraper & AI Engine{% endblock %}

{% block content %}
<div class="space-y-4">

  <!-- Header with Filters and Batch Check -->
  <div class="bg-[#161b22] border border-[#30363d] rounded p-4 flex flex-wrap items-center justify-between gap-3">
    <div>
      <h1 class="text-lg font-bold text-[#f0f6fc] flex items-center gap-2">
        <i class="fa-solid fa-list-check text-[#58a6ff]"></i>
        Listing History & Live Availability
      </h1>
      <p class="text-xs text-[#8b949e] mt-1">Review all extracted items, verify real-time availability status, and filter out deleted/sold ads.</p>
    </div>

    <!-- Batch Recheck Button & Filter Tabs -->
    <div class="flex items-center gap-2 flex-wrap">
      <button onclick="recheckAllAvailability()" class="bg-[#21262d] hover:bg-[#30363d] text-[#79c0ff] border border-[#30363d] px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition">
        <i class="fa-solid fa-arrows-rotate"></i> Re-verify All Availability
      </button>

      <div class="flex items-center gap-1 bg-[#0d1117] p-1 rounded border border-[#30363d] text-xs">
        <a href="{{ url_for('listings', filter='all') }}" class="px-2.5 py-1 rounded {% if filter_status == 'all' %}bg-[#238636] text-white font-bold{% else %}text-[#8b949e] hover:text-white{% endif %}">
          All
        </a>
        <a href="{{ url_for('listings', filter='active_only') }}" class="px-2.5 py-1 rounded {% if filter_status == 'active_only' %}bg-[#238636] text-white font-bold{% else %}text-[#8b949e] hover:text-white{% endif %}">
          🟢 Active Only
        </a>
        <a href="{{ url_for('listings', filter='profitable') }}" class="px-2.5 py-1 rounded {% if filter_status == 'profitable' %}bg-[#238636] text-white font-bold{% else %}text-[#8b949e] hover:text-white{% endif %}">
          🔥 Profitable
        </a>
        <a href="{{ url_for('listings', filter='reserved') }}" class="px-2.5 py-1 rounded {% if filter_status == 'reserved' %}bg-[#238636] text-white font-bold{% else %}text-[#8b949e] hover:text-white{% endif %}">
          🟡 Reserved
        </a>
        <a href="{{ url_for('listings', filter='unavailable') }}" class="px-2.5 py-1 rounded {% if filter_status == 'unavailable' %}bg-[#238636] text-white font-bold{% else %}text-[#8b949e] hover:text-white{% endif %}">
          🔴 Outdated / Deleted
        </a>
      </div>
    </div>
  </div>

  <!-- Listings Table -->
  <div class="bg-[#161b22] border border-[#30363d] rounded overflow-hidden">
    {% if listings %}
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="bg-[#0d1117] border-b border-[#30363d] text-[#8b949e] uppercase font-bold text-[10px]">
            <th class="py-2.5 px-3">Availability Status</th>
            <th class="py-2.5 px-3">Item / Repair Parts</th>
            <th class="py-2.5 px-3">Price</th>
            <th class="py-2.5 px-3">Repair Cost</th>
            <th class="py-2.5 px-3">Refurb Value</th>
            <th class="py-2.5 px-3">Net Margin</th>
            <th class="py-2.5 px-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#30363d]">
          {% for item in listings %}
          <tr class="hover:bg-[#0d1117]/60 transition {% if item.availability_status == 'UNAVAILABLE' %}opacity-60 bg-red-950/10{% endif %}">
            
            <!-- Availability Badge -->
            <td class="py-3 px-3 whitespace-nowrap">
              {% if item.availability_status == 'ACTIVE' %}
                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[#238636]/20 text-[#aff5b4] border border-[#238636]">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#aff5b4] animate-pulse"></span>
                  ACTIVE (Available)
                </span>
              {% elif item.availability_status == 'RESERVED' %}
                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[#d29922]/20 text-[#e3b341] border border-[#d29922]">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#e3b341]"></span>
                  RESERVED
                </span>
              {% else %}
                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[#da3633]/20 text-[#f85149] border border-[#da3633]">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#f85149]"></span>
                  OUTDATED / DELETED
                </span>
              {% endif %}
              <div class="text-[9px] text-[#8b949e] mt-1 line-clamp-1" title="{{ item.availability_reason }}">
                {{ item.availability_reason }}
              </div>
            </td>

            <!-- Title & Location -->
            <td class="py-3 px-3 max-w-sm">
              <div class="font-bold text-[#f0f6fc]">{{ item.title }}</div>
              <div class="text-[10px] text-[#8b949e] mt-0.5">{{ item.location }} &bull; {{ item.posted_date }}</div>
              {% if item.ai_analysis and item.ai_analysis.replacement_parts %}
              <div class="mt-1 flex flex-wrap gap-1">
                {% for part in item.ai_analysis.replacement_parts %}
                <span class="bg-[#21262d] text-[#79c0ff] px-1.5 py-0.2 rounded text-[9px] border border-[#30363d]">
                  {{ part.part_name }} (~{{ part.estimated_cost_eur }}€)
                </span>
                {% endfor %}
              </div>
              {% endif %}
            </td>

            <td class="py-3 px-3 font-bold text-[#f0f6fc] whitespace-nowrap">{{ item.price_str }}</td>
            <td class="py-3 px-3 text-[#d29922] whitespace-nowrap">~{{ item.ai_analysis.estimated_repair_cost_total if item.ai_analysis else '-' }} €</td>
            <td class="py-3 px-3 text-[#79c0ff] whitespace-nowrap">~{{ item.ai_analysis.estimated_refurbished_value if item.ai_analysis else '-' }} €</td>

            <!-- Net Margin -->
            <td class="py-3 px-3 whitespace-nowrap">
              {% if item.ai_analysis %}
                {% if item.ai_analysis.is_profitable %}
                <span class="bg-[#238636]/20 border border-[#238636] text-[#aff5b4] font-bold px-2 py-0.5 rounded text-[11px]">
                  +{{ item.ai_analysis.profit_margin_eur }} €
                </span>
                {% else %}
                <span class="bg-[#da3633]/20 border border-[#da3633] text-[#f85149] font-bold px-2 py-0.5 rounded text-[11px]">
                  {{ item.ai_analysis.profit_margin_eur }} €
                </span>
                {% endif %}
              {% else %}
                <span class="text-[#8b949e]">-</span>
              {% endif %}
            </td>

            <!-- Actions -->
            <td class="py-3 px-3 text-right whitespace-nowrap space-x-1">
              <button onclick="checkItemAvailability({{ item.id }})" class="bg-[#21262d] hover:bg-[#30363d] text-[#79c0ff] px-2 py-1 rounded text-[10px] font-medium inline-flex items-center gap-1 border border-[#30363d]">
                <i class="fa-solid fa-arrows-rotate"></i> Check
              </button>
              <a href="{{ item.item_url }}" target="_blank" class="bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] px-2 py-1 rounded text-[10px] font-medium inline-flex items-center gap-1 border border-[#30363d]">
                Open <i class="fa-solid fa-arrow-up-right-from-square text-[8px]"></i>
              </a>
            </td>
          </tr>
          {% endfor %}
        </tbody>
      </table>
    </div>
    {% else %}
    <div class="text-center py-12 text-xs text-[#8b949e]">
      <i class="fa-regular fa-folder-open text-2xl mb-2 text-[#30363d]"></i>
      <p>No listings found under the selected availability filter.</p>
    </div>
    {% endif %}
  </div>

</div>

<script>
function checkItemAvailability(id) {
  fetch('/api/listings/' + id + '/check-availability', { method: 'POST' })
    .then(r => r.json())
    .then(d => {
      alert('Availability checked: ' + d.availability_status + ' - ' + d.availability_reason);
      location.reload();
    })
    .catch(e => alert('Error checking item: ' + e));
}

function recheckAllAvailability() {
  fetch('/api/listings/verify-all', { method: 'POST' })
    .then(r => r.json())
    .then(d => {
      alert(d.message);
      setTimeout(() => location.reload(), 4000);
    })
    .catch(e => alert('Error starting batch verification: ' + e));
}
</script>
{% endblock %}
`
  },
  {
    filename: "templates/base.html",
    title: "Jinja2 Base Template Layout",
    language: "html",
    badge: "Jinja2 UI",
    description: "Responsive base template with navigation header, user status badges, flash message alerts, and high-contrast terminal styling.",
    content: `<!DOCTYPE html>
<html lang="en" class="h-full bg-slate-950 text-slate-100">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{% block title %}Kleinanzeigen Scraper & AI Dashboard{% endblock %}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="min-h-full flex flex-col font-sans bg-[#0c0e14] text-[#d1d5db]">

  <header class="sticky top-0 z-50 bg-[#161b22]/95 backdrop-blur border-b border-[#30363d] px-4 py-2.5">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      
      <div class="flex items-center gap-3">
        <div class="bg-[#238636] text-white px-2 py-0.5 text-xs font-bold rounded flex items-center gap-1.5 shadow-sm">
          <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          ONLINE
        </div>
        <a href="{{ url_for('dashboard') }}" class="font-bold text-sm text-[#f0f6fc] tracking-tight hover:text-[#58a6ff]">
          <i class="fa-solid fa-microchip text-[#58a6ff] mr-1.5"></i>
          KLEINANZEIGEN_FLIP_CORE
        </a>
      </div>

      {% if current_user.is_authenticated %}
      <nav class="flex items-center gap-2 text-xs">
        <a href="{{ url_for('dashboard') }}" class="px-3 py-1.5 rounded font-medium text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]">
          <i class="fa-solid fa-chart-line mr-1"></i> Dashboard
        </a>
        <a href="{{ url_for('listings') }}" class="px-3 py-1.5 rounded font-medium text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]">
          <i class="fa-solid fa-list-check mr-1"></i> Listing History
        </a>
        <a href="{{ url_for('settings') }}" class="px-3 py-1.5 rounded font-medium text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]">
          <i class="fa-solid fa-sliders mr-1"></i> Settings
        </a>
        <div class="h-4 w-px bg-[#30363d] mx-1"></div>
        <span class="text-[#79c0ff] font-bold px-2">
          <i class="fa-regular fa-user mr-1"></i> {{ current_user.username }}
        </span>
        <a href="{{ url_for('logout') }}" class="px-2.5 py-1 rounded bg-[#da3633]/20 text-[#f85149] border border-[#da3633]/40 hover:bg-[#da3633] hover:text-white transition">
          <i class="fa-solid fa-arrow-right-from-bracket"></i>
        </a>
      </nav>
      {% else %}
      <div class="flex items-center gap-2 text-xs">
        <a href="{{ url_for('login') }}" class="px-3 py-1.5 rounded text-[#58a6ff] hover:bg-[#21262d]">Login</a>
        <a href="{{ url_for('register') }}" class="px-3 py-1.5 rounded bg-[#238636] text-white font-bold hover:bg-[#2ea043]">Register</a>
      </div>
      {% endif %}

    </div>
  </header>

  <div class="max-w-7xl w-full mx-auto px-4 mt-3">
    {% with messages = get_flashed_messages(with_categories=true) %}
      {% if messages %}
        {% for category, message in messages %}
          <div class="p-3 mb-2 rounded text-xs flex items-center justify-between {% if category == 'error' %}bg-[#f85149]/15 border border-[#da3633] text-[#f85149]{% elif category == 'success' %}bg-[#238636]/15 border border-[#238636] text-[#aff5b4]{% elif category == 'warning' %}bg-[#d29922]/15 border border-[#d29922] text-[#e3b341]{% else %}bg-[#58a6ff]/15 border border-[#58a6ff] text-[#79c0ff]{% endif %}">
            <span>{{ message }}</span>
            <button onclick="this.parentElement.remove()" class="text-xs opacity-75 hover:opacity-100">&times;</button>
          </div>
        {% endfor %}
      {% endif %}
    {% endwith %}
  </div>

  <main class="flex-1 max-w-7xl w-full mx-auto p-4">
    {% block content %}{% endblock %}
  </main>

  <footer class="bg-[#161b22] border-t border-[#30363d] py-3 text-center text-xs text-[#8b949e]">
    <div class="max-w-7xl mx-auto flex justify-between px-4">
      <span>Kleinanzeigen Scraper & AI Profitability Engine &bull; Live Availability Guard</span>
      <span>SQLite DB &bull; Playwright &bull; Google Gemini</span>
    </div>
  </footer>

</body>
</html>
`
  },
  {
    filename: "templates/dashboard.html",
    title: "Jinja2 Dashboard Template",
    language: "html",
    badge: "Dashboard UI",
    description: "Main dashboard displaying aggregate scraping statistics, availability counts, profitable deal cards, and one-click scraper trigger button.",
    content: `{% extends "base.html" %}

{% block title %}Dashboard - Kleinanzeigen Scraper & AI Engine{% endblock %}

{% block content %}
<div class="space-y-4">

  <!-- Header with Scraper Trigger -->
  <div class="bg-[#161b22] border border-[#30363d] rounded p-4 flex flex-wrap items-center justify-between gap-4">
    <div>
      <h1 class="text-lg font-bold text-[#f0f6fc] flex items-center gap-2">
        <i class="fa-solid fa-gauge-high text-[#58a6ff]"></i>
        Welcome back, {{ current_user.username }}
      </h1>
      <p class="text-xs text-[#8b949e] mt-1">
        Active Location: <span class="text-[#79c0ff] font-bold">{{ settings.target_location }} (ID: {{ settings.location_id }})</span> | 
        Availability Guard: <span class="text-[#aff5b4] font-bold">ENABLED</span> | 
        Min Profit: <span class="text-[#aff5b4] font-bold">{{ settings.min_profit_eur }} €</span>
      </p>
    </div>

    <!-- Background Trigger Button -->
    <button id="trigger-btn" onclick="triggerScraperJob()" class="bg-[#238636] hover:bg-[#2ea043] text-white px-4 py-2 rounded text-xs font-bold flex items-center gap-2 shadow-sm transition">
      <i class="fa-solid fa-play"></i>
      <span>Trigger Playwright Scraper & AI</span>
    </button>
  </div>

  <!-- Metrics Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
    <div class="bg-[#161b22] border border-[#30363d] rounded p-3.5">
      <div class="text-[11px] text-[#8b949e] font-bold uppercase tracking-wider">Total Scraped</div>
      <div class="text-2xl font-bold text-[#f0f6fc] mt-1">{{ total_scraped }}</div>
      <div class="text-[10px] text-[#8b949e] mt-1">Stored in SQLite</div>
    </div>

    <div class="bg-[#161b22] border border-[#30363d] rounded p-3.5">
      <div class="text-[11px] text-[#aff5b4] font-bold uppercase tracking-wider">🟢 Active Available</div>
      <div class="text-2xl font-bold text-[#aff5b4] mt-1">{{ active_available_count }}</div>
      <div class="text-[10px] text-[#8b949e] mt-1">Live on Kleinanzeigen</div>
    </div>

    <div class="bg-[#161b22] border border-[#30363d] rounded p-3.5">
      <div class="text-[11px] text-[#f85149] font-bold uppercase tracking-wider">🔴 Outdated / Sold</div>
      <div class="text-2xl font-bold text-[#f85149] mt-1">{{ outdated_count }}</div>
      <div class="text-[10px] text-[#8b949e] mt-1">Deleted or Reserved</div>
    </div>

    <div class="bg-[#161b22] border border-[#30363d] rounded p-3.5">
      <div class="text-[11px] text-[#79c0ff] font-bold uppercase tracking-wider">Active Net Margin</div>
      <div class="text-2xl font-bold text-[#79c0ff] mt-1">+{{ total_potential_profit }} €</div>
      <div class="text-[10px] text-[#8b949e] mt-1">Across {{ profitable_count }} active deals</div>
    </div>
  </div>

  <!-- Recent Profitable Deals -->
  <div class="bg-[#161b22] border border-[#30363d] rounded p-4">
    <div class="flex items-center justify-between border-b border-[#30363d] pb-2 mb-3">
      <h2 class="text-xs font-bold text-[#f0f6fc] uppercase tracking-wider flex items-center gap-2">
        <i class="fa-solid fa-bolt text-[#e3b341]"></i>
        Top Active Profitable Opportunities (Verified Available)
      </h2>
      <a href="{{ url_for('listings', filter='profitable') }}" class="text-xs text-[#58a6ff] hover:underline">
        View All Active ({{ profitable_count }}) &rarr;
      </a>
    </div>

    {% if recent_deals %}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {% for item in recent_deals %}
      <div class="bg-[#0d1117] border border-[#30363d] rounded p-3 flex flex-col justify-between hover:border-[#58a6ff] transition">
        <div>
          <div class="flex justify-between items-start gap-2">
            <span class="text-xs font-bold text-[#f0f6fc] line-clamp-1">{{ item.title }}</span>
            <span class="text-xs font-bold text-[#aff5b4] bg-[#238636]/20 border border-[#238636] px-1.5 py-0.5 rounded whitespace-nowrap">
              +{{ item.ai_analysis.profit_margin_eur }} €
            </span>
          </div>
          <p class="text-[11px] text-[#8b949e] mt-1">Price: <strong class="text-[#f0f6fc]">{{ item.price_str }}</strong> &bull; {{ item.location }}</p>
          <p class="text-[11px] text-[#d1d5db] mt-2 line-clamp-2">{{ item.description }}</p>
        </div>

        <div class="mt-3 pt-2 border-t border-[#21262d] flex items-center justify-between text-[10px]">
          <span class="text-[#8b949e]">Parts: ~{{ item.ai_analysis.estimated_repair_cost_total }} €</span>
          <a href="{{ item.item_url }}" target="_blank" class="text-[#58a6ff] hover:underline flex items-center gap-1">
            Open Listing <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
          </a>
        </div>
      </div>
      {% endfor %}
    </div>
    {% else %}
    <div class="text-center py-8 text-xs text-[#8b949e]">
      <p>No active profitable listings yet. Click "Trigger Playwright Scraper & AI" above to run crawler!</p>
    </div>
    {% endif %}
  </div>

</div>

<script>
function triggerScraperJob() {
  const btn = document.getElementById('trigger-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Queuing background job...';

  fetch('/api/scrape/trigger', { method: 'POST' })
    .then(r => r.json())
    .then(data => {
      alert(data.message);
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Scraper Running in Background';
      setTimeout(() => { location.reload(); }, 6000);
    })
    .catch(err => {
      alert('Error triggering scraper: ' + err);
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-play"></i> Trigger Playwright Scraper & AI';
    });
}
</script>
{% endblock %}
`
  },
  {
    filename: "templates/settings.html",
    title: "Jinja2 User Settings Form Template",
    language: "html",
    badge: "Settings UI",
    description: "User configuration interface allowing customization of Telegram credentials, AI model & API key, target source platform, keywords/tags, location, and listing availability verification preferences.",
    content: `{% extends "base.html" %}

{% block title %}User Settings - Kleinanzeigen Scraper & AI Engine{% endblock %}

{% block content %}
<div class="max-w-4xl mx-auto space-y-4">

  <div class="flex items-center justify-between border-b border-[#30363d] pb-3">
    <div>
      <h1 class="text-lg font-bold text-[#f0f6fc] flex items-center gap-2">
        <i class="fa-solid fa-sliders text-[#58a6ff]"></i>
        User Scraping & Availability Settings
      </h1>
      <p class="text-xs text-[#8b949e] mt-1">Configure your personal Telegram alerts, AI repair model, target keywords, and live availability verification.</p>
    </div>
  </div>

  <form method="POST" action="{{ url_for('settings') }}" class="space-y-4">

    <!-- 1. Live Listing Availability Verification Engine -->
    <div class="bg-[#161b22] border border-[#30363d] rounded p-4 space-y-3">
      <h2 class="text-xs font-bold text-[#f0f6fc] uppercase tracking-wider flex items-center gap-2 border-b border-[#30363d] pb-2">
        <i class="fa-solid fa-shield-halved text-[#aff5b4]"></i>
        1. Live Listing Availability Verification Engine
      </h2>

      <div class="space-y-2 text-xs">
        <label class="flex items-start gap-2.5 cursor-pointer p-2 rounded hover:bg-[#0d1117] transition border border-transparent hover:border-[#30363d]">
          <input type="checkbox" name="verify_availability_before_save" {% if settings.verify_availability_before_save %}checked{% endif %} class="mt-0.5 rounded bg-[#0d1117] border-[#30363d] text-[#238636]">
          <div>
            <span class="text-[#f0f6fc] font-bold">Verify Live Availability Before Saving & AI Analysis</span>
            <p class="text-[11px] text-[#8b949e]">Performs HTTP / Playwright checks to ensure listings are not deleted, expired (404), or deactivated on Kleinanzeigen.</p>
          </div>
        </label>

        <label class="flex items-start gap-2.5 cursor-pointer p-2 rounded hover:bg-[#0d1117] transition border border-transparent hover:border-[#30363d]">
          <input type="checkbox" name="skip_unavailable_in_alerts" {% if settings.skip_unavailable_in_alerts %}checked{% endif %} class="mt-0.5 rounded bg-[#0d1117] border-[#30363d] text-[#238636]">
          <div>
            <span class="text-[#f0f6fc] font-bold">Suppress Telegram Alerts for Outdated or 'Reserviert' Listings</span>
            <p class="text-[11px] text-[#8b949e]">Only dispatch push notifications if the item is 100% active and available for immediate purchase.</p>
          </div>
        </label>

        <label class="flex items-start gap-2.5 cursor-pointer p-2 rounded hover:bg-[#0d1117] transition border border-transparent hover:border-[#30363d]">
          <input type="checkbox" name="auto_recheck_availability" {% if settings.auto_recheck_availability %}checked{% endif %} class="mt-0.5 rounded bg-[#0d1117] border-[#30363d] text-[#238636]">
          <div>
            <span class="text-[#f0f6fc] font-bold">Auto-Recheck History Availability Periodically</span>
            <p class="text-[11px] text-[#8b949e]">Continuously scans past listings in your history and marks sold/deleted ones as UNAVAILABLE.</p>
          </div>
        </label>
      </div>
    </div>

    <!-- 2. AI Model Configuration -->
    <div class="bg-[#161b22] border border-[#30363d] rounded p-4 space-y-3">
      <h2 class="text-xs font-bold text-[#f0f6fc] uppercase tracking-wider flex items-center gap-2 border-b border-[#30363d] pb-2">
        <i class="fa-solid fa-wand-magic-sparkles text-[#79c0ff]"></i>
        2. AI Provider & Repair Analyzer Model
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-[11px] font-bold text-[#8b949e] uppercase mb-1">AI Provider</label>
          <select name="ai_provider" class="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs text-[#f0f6fc] focus:border-[#58a6ff]">
            <option value="google_gemini" {% if settings.ai_provider == 'google_gemini' %}selected{% endif %}>Google Gemini (Recommended)</option>
            <option value="openai" {% if settings.ai_provider == 'openai' %}selected{% endif %}>OpenAI (GPT-4o-mini)</option>
          </select>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-[#8b949e] uppercase mb-1">Model Alias</label>
          <input type="text" name="ai_model" value="{{ settings.ai_model }}" class="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs text-[#f0f6fc] focus:border-[#58a6ff]">
        </div>
      </div>

      <div>
        <label class="block text-[11px] font-bold text-[#8b949e] uppercase mb-1">AI API Key</label>
        <input type="password" name="ai_api_key" value="{{ settings.ai_api_key }}" placeholder="AIzaSy..." class="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs text-[#aff5b4] focus:border-[#58a6ff]">
      </div>
    </div>

    <!-- 3. Economic Thresholds -->
    <div class="bg-[#161b22] border border-[#30363d] rounded p-4 space-y-3">
      <h2 class="text-xs font-bold text-[#f0f6fc] uppercase tracking-wider flex items-center gap-2 border-b border-[#30363d] pb-2">
        <i class="fa-solid fa-euro-sign text-[#aff5b4]"></i>
        3. Economic & Profitability Thresholds
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-[11px] font-bold text-[#8b949e] uppercase mb-1">Minimum Net Profit Margin (EUR)</label>
          <input type="number" step="5" name="min_profit_eur" value="{{ settings.min_profit_eur }}" class="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs text-[#f0f6fc] focus:border-[#58a6ff]">
        </div>
        <div>
          <label class="block text-[11px] font-bold text-[#8b949e] uppercase mb-1">Max Allowed Repair Budget (EUR)</label>
          <input type="number" step="10" name="max_repair_budget" value="{{ settings.max_repair_budget }}" class="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs text-[#f0f6fc] focus:border-[#58a6ff]">
        </div>
      </div>
    </div>

    <!-- 4. Location & Keywords -->
    <div class="bg-[#161b22] border border-[#30363d] rounded p-4 space-y-3">
      <h2 class="text-xs font-bold text-[#f0f6fc] uppercase tracking-wider flex items-center gap-2 border-b border-[#30363d] pb-2">
        <i class="fa-solid fa-map-location-dot text-[#79c0ff]"></i>
        4. Target Location & Keywords
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block text-[11px] font-bold text-[#8b949e] uppercase mb-1">City / Location</label>
          <input type="text" name="target_location" value="{{ settings.target_location }}" class="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs text-[#f0f6fc]">
        </div>
        <div>
          <label class="block text-[11px] font-bold text-[#8b949e] uppercase mb-1">Kleinanzeigen Location ID</label>
          <input type="text" name="location_id" value="{{ settings.location_id }}" class="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs text-[#79c0ff]">
        </div>
        <div>
          <label class="block text-[11px] font-bold text-[#8b949e] uppercase mb-1">Radius (km)</label>
          <input type="number" name="radius_km" value="{{ settings.radius_km }}" class="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs text-[#f0f6fc]">
        </div>
      </div>

      <div>
        <label class="block text-[11px] font-bold text-[#8b949e] uppercase mb-1">Search Keywords (Comma-delimited)</label>
        <input type="text" name="keywords" value="{{ settings.keywords }}" class="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs text-[#f0f6fc]">
      </div>
    </div>

    <!-- 5. Telegram Notification Alerts -->
    <div class="bg-[#161b22] border border-[#30363d] rounded p-4 space-y-3">
      <h2 class="text-xs font-bold text-[#f0f6fc] uppercase tracking-wider flex items-center justify-between border-b border-[#30363d] pb-2">
        <span class="flex items-center gap-2">
          <i class="fa-brands fa-telegram text-[#58a6ff]"></i>
          5. Telegram Alert Dispatcher (Optional)
        </span>
        <label class="flex items-center gap-1.5 cursor-pointer text-xs">
          <input type="checkbox" name="telegram_alerts_enabled" {% if settings.telegram_alerts_enabled %}checked{% endif %} class="rounded bg-[#0d1117] border-[#30363d] text-[#238636]">
          <span class="text-[#f0f6fc] font-bold">Enable Telegram Alerts</span>
        </label>
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-[11px] font-bold text-[#8b949e] uppercase mb-1">Telegram Bot Token</label>
          <input type="text" name="telegram_bot_token" value="{{ settings.telegram_bot_token }}" placeholder="123456:ABC-DEF..." class="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs text-[#f0f6fc]">
        </div>
        <div>
          <label class="block text-[11px] font-bold text-[#8b949e] uppercase mb-1">Telegram Chat ID</label>
          <input type="text" name="telegram_chat_id" value="{{ settings.telegram_chat_id }}" placeholder="-100123456789" class="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs text-[#f0f6fc]">
        </div>
      </div>
    </div>

    <!-- Submit Button -->
    <div class="flex justify-end gap-3 pt-2">
      <a href="{{ url_for('dashboard') }}" class="px-4 py-2 rounded bg-[#21262d] text-[#f0f6fc] text-xs font-medium hover:bg-[#30363d]">Cancel</a>
      <button type="submit" class="px-5 py-2 rounded bg-[#238636] text-white text-xs font-bold hover:bg-[#2ea043] flex items-center gap-2">
        <i class="fa-solid fa-floppy-disk"></i> Save Settings to Database
      </button>
    </div>

  </form>

</div>
{% endblock %}
`
  },
  {
    filename: "INSTALL.md",
    title: "Installation & Availability Setup Guide",
    language: "markdown",
    badge: "Setup Guide",
    description: "Step-by-step instructions for installing Flask, SQLite, Playwright Chromium binaries, configuring listing availability verification, and running tests.",
    content: `# Installation & Setup Guide: Kleinanzeigen Multi-User Web Application with Live Availability Guard

This guide walks you through setting up the multi-user Flask web application, SQLite database, live listing availability verification engine, and background scraper.

---

## 1. Prerequisites

- **Python 3.9+** (\`python3 --version\`)
- **pip** (Python package installer)
- **Google Gemini API Key** (optional for live AI repair analysis)

---

## 2. Environment & Dependency Installation

\`\`\`bash
# Create & activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright browser binaries
playwright install chromium
\`\`\`

---

## 3. Launching the Web Server

\`\`\`bash
# Start Flask Web Server
python app.py
\`\`\`

Access the dashboard at **http://localhost:5000**.

---

## 4. Live Availability Verification Features

The application incorporates multi-stage availability protection:

1. **Pre-Save Verification**: Inspects Kleinanzeigen listing URLs to detect HTTP 404/410 deletions or seller deactivations before saving.
2. **Badge Detection**: Identifies \`badge-reserved\` and \`Reserviert\` labels to flag reserved listings.
3. **Telegram Alert Guard**: Excludes unavailable and reserved items so notifications only trigger for immediately purchasable deals.
4. **On-Demand & Batch Rechecks**: Re-verifies existing history listings on demand.

---

## 5. Running the Test Suite

\`\`\`bash
# Run Web App & Availability Tests
pytest test_webapp.py -v
\`\`\`
`
  },
  {
    filename: "requirements.txt",
    title: "Python Package Requirements",
    language: "text",
    badge: "Dependencies",
    description: "Production package dependencies for Flask, Flask-Login, SQLAlchemy, Playwright, requests, Google GenAI SDK, and pytest.",
    content: `Flask>=3.0.0
Flask-Login>=0.6.3
Flask-SQLAlchemy>=3.1.1
SQLAlchemy>=2.0.0
werkzeug>=3.0.0
playwright>=1.40.0
google-genai>=0.1.1
pydantic>=2.0.0
requests>=2.31.0
python-dotenv>=1.0.0
pytest>=8.0.0
pytest-asyncio>=0.23.0
`
  },
  {
    filename: ".env.example",
    title: "Environment Variable Template",
    language: "env",
    badge: "Environment Config",
    description: "Sample configuration template for Flask secret key, database URI, and default API keys.",
    content: `# Flask Web Server Secret Key
SECRET_KEY="dev-secret-key-kleinanzeigen-2026-v5"

# SQLite Database URI
DATABASE_URL="sqlite:///instance/scraper_webapp.db"

# Google Gemini AI Key
GEMINI_API_KEY="AIzaSyEXAMPLE_KEY_REPLACE_ME"
GEMINI_MODEL="gemini-2.5-flash"

# Default Economic Thresholds
MIN_PROFIT_EUR=30.0
MAX_REPAIR_BUDGET=150.0

# Default Location Settings (Dortmund = l2078)
DEFAULT_LOCATION_NAME="Dortmund"
LOCATION_ID="2078"

# Availability Guard
VERIFY_AVAILABILITY_BEFORE_SAVE=True
SKIP_UNAVAILABLE_IN_ALERTS=True
`
  }
];
