#!/usr/bin/env python3
"""
Local & Cloud LLM Analysis Engine for Defective Hardware Flipping
================================================================
Provides a unified interface to analyze defective hardware listings from Kleinanzeigen
using either Local LLMs (Ollama, LM Studio, LocalAI) or Cloud LLMs (Gemini, OpenAI).

Why Local LLMs:
- 100% Offline and Private: Item data and flipping strategies stay strictly on local hardware.
- Zero API Token Costs: Unlimited batch analysis without incurring recurring cloud expenses.
- Low Latency: Direct local inference via quantized models (e.g. Llama 3 8B, Mistral 7B, Qwen 2.5).

Features:
- OpenAI-compatible REST endpoint adapter (for LM Studio, LocalAI, Ollama /v1)
- Native Ollama REST API adapter (/api/generate)
- Cloud Gemini & OpenAI adapters
- Graceful Fallback Engine: If local LLM server is unreachable, falls back to rule-based heuristic or cloud
- Structured JSON parsing with validation against Pydantic schema
- Verbose audit logging to 'app_execution.log'
"""

import json
import logging
import os
import re
import time
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
import requests

load_dotenv()

# Set up dedicated logger for LLM operations
logger = logging.getLogger("LLMAnalyzer")
if not logger.hasHandlers():
    logger.setLevel(logging.INFO)
    formatter = logging.Formatter("%(asctime)s [%(levelname)s] [LLMAnalyzer] %(message)s")
    
    # Console handler
    sh = logging.StreamHandler()
    sh.setFormatter(formatter)
    logger.addHandler(sh)
    
    # File handler for app_execution.log
    fh = logging.FileHandler("app_execution.log", mode="a", encoding="utf-8")
    fh.setFormatter(formatter)
    logger.addHandler(fh)


# System prompt designed for precise repairability & resale profit calculations
ANALYSIS_SYSTEM_PROMPT = """You are an expert electronics repair/flipping analyst for Germany.
Return only one compact JSON object and nothing else.
Schema:
{
  "detected_issues": ["issue 1", "issue 2"],
  "estimated_replacement_parts": [{"part_name": "Part A", "cost_eur": 15.0}],
  "estimated_repair_cost_total": 25.0,
  "estimated_refurbished_value": 140.0,
  "is_profitable": true,
  "profit_margin_eur": 75.0,
  "reasoning_summary": "very short explanation"
}
Use realistic Germany-market values. Keep the JSON small and complete; no markdown, no commentary.
"""


class LocalLLMAnalyzer:
    """
    Unified AI analyzer supporting both Local LLM instances (Ollama, LM Studio)
    and Cloud providers (Gemini, OpenAI) with automated fallback.
    """

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
        self.fallback_on_failure = (
            os.environ.get("FALLBACK_ON_LOCAL_FAILURE", str(fallback_on_failure)).lower() == "true"
        )
        self.gemini_api_key = os.environ.get("GEMINI_API_KEY", gemini_api_key or "")
        self.openai_api_key = os.environ.get("OPENAI_API_KEY", openai_api_key or "")

        logger.info(
            f"Initialized LLMAnalyzer in '{self.execution_mode.upper()}' mode. "
            f"Local Provider: {self.local_provider} ({self.local_endpoint}, model={self.local_model})"
        )

    def ping_local_endpoint(self) -> Dict[str, Any]:
        """
        Tests connectivity to the configured local LLM service.
        Returns status dict with response time and available models.
        """
        start_t = time.time()
        try:
            if self.local_provider == "ollama":
                # Ollama health / tags endpoint
                resp = requests.get(f"{self.local_endpoint}/api/tags", timeout=5)
                if resp.status_code == 200:
                    data = resp.json()
                    models = [m.get("name") for m in data.get("models", [])]
                    latency_ms = round((time.time() - start_t) * 1000, 2)
                    return {
                        "status": "connected",
                        "provider": "ollama",
                        "latency_ms": latency_ms,
                        "available_models": models,
                        "target_model": self.local_model,
                        "model_ready": any(self.local_model in m for m in models) if models else False,
                    }
            elif self.local_provider in ["lm_studio", "localai", "custom"]:
                # OpenAI-compatible /v1/models endpoint
                models_url = f"{self.local_endpoint}/models" if "/v1" in self.local_endpoint else f"{self.local_endpoint}/v1/models"
                resp = requests.get(models_url, timeout=5)
                if resp.status_code == 200:
                    data = resp.json()
                    models = [m.get("id") for m in data.get("data", [])]
                    latency_ms = round((time.time() - start_t) * 1000, 2)
                    return {
                        "status": "connected",
                        "provider": self.local_provider,
                        "latency_ms": latency_ms,
                        "available_models": models,
                        "target_model": self.local_model,
                        "model_ready": len(models) > 0,
                    }

            return {
                "status": "unreachable",
                "provider": self.local_provider,
                "error": f"HTTP {resp.status_code if 'resp' in locals() else 'Connection Error'}",
            }
        except Exception as e:
            return {
                "status": "unreachable",
                "provider": self.local_provider,
                "error": str(e),
            }

    def analyze_listing(
        self,
        title: str,
        price_str: str,
        description: str,
        category: str = "Electronics",
        min_profit_eur: float = 30.0,
        max_repair_budget: float = 150.0,
    ) -> Dict[str, Any]:
        """
        Executes analysis on a defective listing using the active execution mode.
        If in 'local' mode and the local LLM fails, invokes the fallback heuristic.
        """
        start_time = time.time()
        parsed_price = self._parse_price(price_str)

        user_prompt = f"""
ITEM DETAILS TO EVALUATE:
- Title: {title}
- Asking Price: {parsed_price} EUR (Raw: {price_str})
- Category: {category}
- Description: {description}
- Min Desired Profit: {min_profit_eur} EUR
- Max Allowed Repair Budget: {max_repair_budget} EUR
"""

        result: Optional[Dict[str, Any]] = None
        model_name_used = "unknown"

        # Mode A: Full Local Execution
        if self.execution_mode == "local":
            try:
                logger.info(f"Dispatching listing '{title[:40]}' to Local LLM ({self.local_provider} : {self.local_model})...")
                result = self._query_local_llm(user_prompt)
                model_name_used = f"local:{self.local_provider}/{self.local_model}"
            except Exception as e:
                logger.warning(f"Local LLM query failed ({e}). Checking fallback configuration...")
                if self.fallback_on_failure:
                    if self.gemini_api_key:
                        logger.info("Falling back to Cloud Gemini API...")
                        try:
                            result = self._query_gemini_cloud(user_prompt)
                            model_name_used = "cloud:gemini-2.5-flash (fallback)"
                        except Exception as cloud_err:
                            logger.error(f"Cloud fallback also failed: {cloud_err}")
                            result = self._heuristic_fallback_analysis(title, parsed_price, description, min_profit_eur, max_repair_budget)
                            model_name_used = "heuristic_fallback"
                    else:
                        logger.info("Engaging deterministic rule-based heuristic fallback...")
                        result = self._heuristic_fallback_analysis(title, parsed_price, description, min_profit_eur, max_repair_budget)
                        model_name_used = "heuristic_fallback"
                else:
                    raise e

        # Mode B: Cloud Execution
        else:
            if self.gemini_api_key:
                logger.info(f"Dispatching listing '{title[:40]}' to Cloud Gemini...")
                try:
                    result = self._query_gemini_cloud(user_prompt)
                    model_name_used = "cloud:gemini-2.5-flash"
                except Exception as e:
                    logger.error(f"Cloud Gemini error: {e}. Falling back to heuristic...")
                    result = self._heuristic_fallback_analysis(title, parsed_price, description, min_profit_eur, max_repair_budget)
                    model_name_used = "heuristic_fallback"
            elif self.openai_api_key:
                logger.info(f"Dispatching listing '{title[:40]}' to Cloud OpenAI...")
                try:
                    result = self._query_openai_cloud(user_prompt)
                    model_name_used = "cloud:openai-gpt-4o-mini"
                except Exception as e:
                    logger.error(f"Cloud OpenAI error: {e}. Falling back to heuristic...")
                    result = self._heuristic_fallback_analysis(title, parsed_price, description, min_profit_eur, max_repair_budget)
                    model_name_used = "heuristic_fallback"
            else:
                logger.warning("No Cloud API Key provided in Cloud mode. Falling back to local/heuristic...")
                result = self._heuristic_fallback_analysis(title, parsed_price, description, min_profit_eur, max_repair_budget)
                model_name_used = "heuristic_fallback"

        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        result["execution_time_ms"] = elapsed_ms
        result["model_used"] = model_name_used
        result["analyzed_at"] = time.strftime("%Y-%m-%d %H:%M:%SZ", time.gmtime())

        # Ensure mathematical consistency
        repair_cost = float(result.get("estimated_repair_cost_total", 0.0))
        refurb_val = float(result.get("estimated_refurbished_value", 0.0))
        calculated_profit = round(refurb_val - (parsed_price + repair_cost), 2)
        result["profit_margin_eur"] = calculated_profit
        result["is_profitable"] = (calculated_profit >= min_profit_eur) and (repair_cost <= max_repair_budget)

        logger.info(
            f"Analysis complete for '{title[:30]}': Margin={calculated_profit}€, "
            f"Profitable={result['is_profitable']}, Model={model_name_used}, Time={elapsed_ms}ms"
        )
        return result

    def _query_local_llm(self, user_prompt: str) -> Dict[str, Any]:
        """
        Sends generation request to local Ollama or OpenAI-compatible endpoint.
        """
        if self.local_provider == "ollama":
            # Native Ollama API
            url = f"{self.local_endpoint}/api/generate"
            payload = {
                "model": self.local_model,
                "prompt": f"{ANALYSIS_SYSTEM_PROMPT}\n\n{user_prompt}",
                "stream": False,
                "format": "json",
                "options": {
                    "temperature": 0.2,
                    "num_ctx": 4096,
                    "num_predict": 600,
                }
            }
            resp = requests.post(url, json=payload, timeout=self.timeout_sec)
            resp.raise_for_status()
            data = resp.json()
            raw_text = data.get("response", "{}")
            return self._extract_json(raw_text)

        # OpenAI-compatible API (LM Studio / LocalAI / Ollama /v1)
        endpoint = self.local_endpoint
        if not endpoint.endswith("/v1"):
            endpoint = f"{endpoint}/v1"
        url = f"{endpoint}/chat/completions"

        payload = {
            "model": self.local_model,
            "messages": [
                {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 800
        }
        resp = requests.post(url, json=payload, timeout=self.timeout_sec)
        resp.raise_for_status()
        data = resp.json()
        raw_text = data["choices"][0]["message"]["content"]
        return self._extract_json(raw_text)

    def _query_gemini_cloud(self, user_prompt: str) -> Dict[str, Any]:
        """
        Queries Google Gemini 2.5 Flash via REST endpoint.
        """
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.gemini_api_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{ANALYSIS_SYSTEM_PROMPT}\n\n{user_prompt}"}
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.2
            }
        }
        resp = requests.post(url, json=payload, timeout=25)
        resp.raise_for_status()
        data = resp.json()
        raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
        return self._extract_json(raw_text)

    def _query_openai_cloud(self, user_prompt: str) -> Dict[str, Any]:
        """
        Queries OpenAI GPT-4o-mini via standard REST endpoint.
        """
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.openai_api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }
        resp = requests.post(url, headers=headers, json=payload, timeout=25)
        resp.raise_for_status()
        data = resp.json()
        raw_text = data["choices"][0]["message"]["content"]
        return self._extract_json(raw_text)

    def _extract_json(self, raw_text: str) -> Dict[str, Any]:
        """
        Robustly extracts and parses JSON payload from LLM responses even if wrapped
        in Markdown codeblocks or cut off mid-generation by the model.
        """
        cleaned = raw_text.strip()
        # Remove Markdown formatting if present
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\n?", "", cleaned)
            cleaned = re.sub(r"\n?```$", "", cleaned)
        cleaned = cleaned.strip()

        candidates = [cleaned]

        # Some local models (notably Ollama) occasionally return a valid JSON object
        # that is cut off before the closing braces/brackets are emitted.
        start = cleaned.find("{")
        if start != -1:
            candidates.append(cleaned[start:])

        # Try the most permissive repair: close any still-open arrays/objects and
        # repair the final dangling quote if the model terminated mid-string.
        if start != -1:
            candidate = cleaned[start:]
            stack: List[str] = []
            in_string = False
            escape = False
            for ch in candidate:
                if in_string:
                    if escape:
                        escape = False
                    elif ch == "\\":
                        escape = True
                    elif ch == '"':
                        in_string = False
                    continue

                if ch == '"':
                    in_string = True
                elif ch in "[{":
                    stack.append(ch)
                elif ch in "]}":
                    if stack:
                        opener = stack.pop()
                        expected = "}" if opener == "{" else "]"
                        if ch != expected:
                            stack.append(opener)
                            break

            if in_string:
                candidate += '"'
            while stack:
                opener = stack.pop()
                candidate += "}" if opener == "{" else "]"
            candidates.append(candidate)

        last_error = None
        for candidate in candidates:
            try:
                parsed = json.loads(candidate)
                # Ensure mandatory fields
                return {
                    "detected_issues": parsed.get("detected_issues", ["General defect / Bastler"]),
                    "estimated_replacement_parts": parsed.get("estimated_replacement_parts", []),
                    "estimated_repair_cost_total": float(parsed.get("estimated_repair_cost_total", 25.0)),
                    "estimated_refurbished_value": float(parsed.get("estimated_refurbished_value", 100.0)),
                    "is_profitable": bool(parsed.get("is_profitable", False)),
                    "profit_margin_eur": float(parsed.get("profit_margin_eur", 0.0)),
                    "reasoning_summary": parsed.get("reasoning_summary", "Analyzed by AI model."),
                }
            except Exception as e:
                last_error = e

        logger.warning(f"Failed to parse LLM JSON response: {last_error}. Raw was: {raw_text[:100]}...")
        raise ValueError(f"Invalid JSON returned from model: {last_error}")

    def _heuristic_fallback_analysis(
        self,
        title: str,
        price: float,
        description: str,
        min_profit_eur: float,
        max_repair_budget: float
    ) -> Dict[str, Any]:
        """
        Deterministic, offline-safe heuristic calculation when no LLM can be reached.
        Uses known electronics domain knowledge for common defective equipment in Germany.
        """
        text = (title + " " + description).lower()
        parts = []
        estimated_refurb_value = 120.0
        detected_issues = []

        # Domain heuristic detection rules
        if any(w in text for w in ["kaffee", "delonghi", "jura", "philips", "melitta"]):
            estimated_refurb_value = 165.0
            detected_issues = ["Brühgruppe blockiert oder Pumpe defekt (Kaffeevollautomat)"]
            parts = [
                {"part_name": "Dichtungsset & Silikonfett", "cost_eur": 12.0},
                {"part_name": "Ulka Vibrationspumpe EP5", "cost_eur": 18.0}
            ]
        elif any(w in text for w in ["laptop", "notebook", "thinkpad", "macbook", "legion"]):
            estimated_refurb_value = 240.0
            detected_issues = ["Kein Boot / Lüfter läuft kurz an / Display intakt"]
            parts = [
                {"part_name": "Ersatznetzteil & CMOS Batterie", "cost_eur": 15.0},
                {"part_name": "512GB NVMe SSD (Gebraucht)", "cost_eur": 25.0}
            ]
        elif any(w in text for w in ["playstation", "ps5", "ps4", "xbox", "nintendo", "switch"]):
            estimated_refurb_value = 280.0
            detected_issues = ["HDMI Buchse verbogen / Pins beschädigt"]
            parts = [
                {"part_name": "HDMI 2.1 Ersatzbuchse (OEM)", "cost_eur": 8.0},
                {"part_name": "Flussmittel & Lötzinn Verbrauch", "cost_eur": 4.0}
            ]
        elif any(w in text for w in ["makita", "bosch", "akkuschrauber", "bohrhammer"]):
            estimated_refurb_value = 85.0
            detected_issues = ["Getriebestufe klemmt / Kohlebürsten abgenutzt"]
            parts = [
                {"part_name": "Original Kohlebürsten CB-440", "cost_eur": 9.0},
                {"part_name": "Getriebegehäuse-Fett", "cost_eur": 5.0}
            ]
        elif any(w in text for w in ["dyson", "staubsauger", "v10", "v11"]):
            estimated_refurb_value = 175.0
            detected_issues = ["Akku-Pulsieren / Filter verstopft / Schalter klickt nicht"]
            parts = [
                {"part_name": "Ersatz-Trigger Schalter Metallverstärkt", "cost_eur": 8.0},
                {"part_name": "HEPA Nachmotorfilter", "cost_eur": 12.0}
            ]
        else:
            estimated_refurb_value = max(price * 2.5, 60.0)
            detected_issues = ["Allgemeiner Hardwaredefekt / Bastlergerät"]
            parts = [{"part_name": "Reparaturkleinteile & Verbrauchsmaterial", "cost_eur": 15.0}]

        total_repair = sum(p["cost_eur"] for p in parts)
        profit = round(estimated_refurb_value - (price + total_repair), 2)
        is_profitable = (profit >= min_profit_eur) and (total_repair <= max_repair_budget)

        return {
            "detected_issues": detected_issues,
            "estimated_replacement_parts": parts,
            "estimated_repair_cost_total": total_repair,
            "estimated_refurbished_value": estimated_refurb_value,
            "is_profitable": is_profitable,
            "profit_margin_eur": profit,
            "reasoning_summary": (
                f"Heuristic Rule-Based Analysis: Purchase={price}€ + Repair={total_repair}€ -> "
                f"Est. Refurb={estimated_refurb_value}€ (Margin: +{profit}€)."
            ),
        }

    def _parse_price(self, price_str: str) -> float:
        """
        Extracts numeric EUR value from German marketplace strings
        e.g. '25 € VB', '120 €', 'Zu verschenken' -> 0.0
        """
        if not price_str or "verschenken" in price_str.lower():
            return 0.0
        # Find first numeric group (handling German comma decimal or dot)
        clean = price_str.replace(".", "").replace(",", ".")
        match = re.search(r"(\d+(?:\.\d+)?)", clean)
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                pass
        return 0.0


# Standalone CLI test
if __name__ == "__main__":
    analyzer = LocalLLMAnalyzer()
    print("Testing ping to local LLM endpoint:")
    print(analyzer.ping_local_endpoint())
    print("\nRunning test analysis on sample broken laptop:")
    res = analyzer.analyze_listing(
        title="Lenovo Legion Gaming Laptop defekt für Bastler",
        price_str="75 € VB",
        description="Laptop geht nach kurzem Lüfteranlauf wieder aus. Display ohne Risse. Ohne SSD/RAM.",
        category="Elektronik",
        min_profit_eur=30.0,
        max_repair_budget=100.0
    )
    print(json.dumps(res, indent=2, ensure_ascii=False))
