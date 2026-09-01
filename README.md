# ⚡ Kleinanzeigen Defekt Scraper & AI Profitability Engine (Dortmund Edition)

[![Python Version](https://img.shields.io/badge/python-3.10%20%7C%203.11%20%7C%203.12-blue.svg)](https://www.python.org/)
[![Playwright](https://img.shields.io/badge/playwright-async%20headless-green.svg)](https://playwright.dev/python/)
[![Local LLM](https://img.shields.io/badge/Local%20LLM-Ollama%20%7C%20LM%20Studio-orange.svg)](https://ollama.com/)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](LICENSE)
[![Smoke Test](https://img.shields.io/badge/smoke%20test-30s%20automated-brightgreen.svg)](smoke_test.py)

A production-grade, asynchronous marketplace scraping and AI-powered hardware flipping engine built specifically for **Kleinanzeigen.de** (targeting **Dortmund, Germany - Location ID `l2078`**).

The system monitors listings for broken, repairable, or "für Bastler" items (e.g. laptops, gaming consoles, espresso machines, power tools, robotic vacuums), runs economic profitability analyses using **Local LLMs (Ollama / LM Studio)** or **Cloud LLMs (Gemini / OpenAI)**, verifies listing availability, and dispatches actionable deal alerts.

---

## 📑 Table of Contents

1. [Project Overview & Architecture Blueprint](#1-project-overview--architecture-blueprint)
2. [Technical Specifications](#2-technical-specifications)
3. [Prerequisites & System Requirements](#3-prerequisites--system-requirements)
4. [Step-by-Step Installation Guide](#4-step-by-step-installation-guide)
5. [Configuration & Dual Execution Modes](#5-configuration--dual-execution-modes)
6. [How to Run](#6-how-to-run)
7. [Automated Smoke Testing](#7-automated-smoke-testing)
8. [Troubleshooting & FAQ](#8-troubleshooting--faq)
9. [Directory Structure & Contributing](#9-directory-structure--contributing)

---

## 1. Project Overview & Architecture Blueprint

### System Architecture Flow

```
                                  +---------------------------------------+
                                  |    Kleinanzeigen Marketplace (DE)    |
                                  |      Location: Dortmund (l2078)       |
                                  +-------------------+-------------------+
                                                      |
                                                      v [Async Playwright Chromium]
                                      +---------------+---------------+
                                      |   Stealth Scraper Worker      |
                                      | - Anti-bot detection headers  |
                                      | - Cookie banner auto-dismiss  |
                                      | - Jittered timing & parsing   |
                                      +---------------+---------------+
                                                      |
                                                      v
                                      +---------------+---------------+
                                      |  Listing Availability Engine  |
                                      | - Fast HTTP active/sold check |
                                      | - Deduplication (Seen DB)     |
                                      +---------------+---------------+
                                                      |
                         +----------------------------+----------------------------+
                         |                                                         |
                         v [Mode A: Local Execution]                               v [Mode B: Cloud Execution]
            +------------+------------+                               +------------+------------+
            |      Ollama / LM Studio |                               |   Google Gemini 2.5     |
            |   (Llama 3 / Mistral)   |                               |   OpenAI GPT-4o-mini    |
            |  100% Offline & Private |                               |   Cloud API Processing  |
            +------------+------------+                               +------------+------------+
                         |                                                         |
                         +----------------------------+----------------------------+
                                                      |
                                                      v [Structured JSON Repair Schema]
                                      +---------------+---------------+
                                      |   Profitability Calculator    |
                                      | - Issue & Parts Cost Est.     |
                                      | - Refurbished Resale Value    |
                                      | - Net Margin Filter (>= 30€)  |
                                      +---------------+---------------+
                                                      |
                                     +----------------+----------------+
                                     |                                 |
                                     v                                 v
                     +---------------+---------------+ +---------------+---------------+
                     |   SQLite Multi-Tenant DB      | |  Telegram Alert Dispatcher    |
                     |  & Flask Web Dashboard (UI)   | | - Direct Item Link            |
                     | - Real-time Status Badges     | | - Live Dortmund Search Link   |
                     | - Availability Re-check API   | | - Refurb Margin Breakdown     |
                     +-------------------------------+ +-------------------------------+
```

### Core Value Propositions
* **Dual Execution Modes (Local vs. Cloud)**: Choose between 100% offline, privacy-first local inference (Ollama/LM Studio with zero API bills) or high-throughput cloud inference (Gemini / OpenAI).
* **Guaranteed Dual-Link Alerts**: Defective deals with huge margins sell fast on Kleinanzeigen. Every notification and card provides both the **direct listing link** and a **live search query** (`/s-dortmund/.../k0l2078`) to browse active Dortmund inventory if the ad sells out.
* **Pre-Save Availability Guard**: Scans ad responsiveness before AI processing to save compute and suppress dead listing alerts.
* **Multi-Tenant Flask Web App**: Complete with user authentication, custom search parameters, live availability re-checks, and export utilities (JSON/CSV).

---

## 2. Technical Specifications

| Subsystem | Technology | Purpose |
| :--- | :--- | :--- |
| **Language & Runtime** | Python 3.10+ / Asyncio | High-performance asynchronous execution loop |
| **Browser Engine** | Playwright (Chromium) | Headless browser with stealth anti-detection headers |
| **Local LLM Providers** | Ollama, LM Studio, LocalAI | Local AI inference via OpenAI-compatible `/v1` or native REST |
| **Cloud AI Providers** | Google Gemini 2.5 Flash, OpenAI | Fast cloud inference fallback |
| **Web Framework** | Flask 3.0 + Jinja2 + Tailwind | Responsive UI with real-time SSE progress & REST endpoints |
| **Database** | SQLite with WAL & Foreign Keys | Multi-user partitioned storage, settings, and listing archives |
| **Alerting Engine** | Telegram Bot API / Webhooks | Instant push notifications for profitable repair opportunities |
| **Testing Suite** | Pytest + Custom 30s Smoke Test | Automated end-to-end component verification |

---

## 3. Prerequisites & System Requirements

### Hardware Requirements for Local LLMs

| Model Tier | Model Examples | Minimum RAM | Recommended Hardware | Inference Speed |
| :--- | :--- | :--- | :--- | :--- |
| **Lightweight** | `phi3:mini`, `qwen2.5:3b` | 8 GB RAM | Any modern Quad-Core CPU or M1 Mac | 20-35 tok/sec |
| **Balanced (Recommended)** | `llama3:8b`, `mistral:7b` | 16 GB RAM | Apple Silicon (M1/M2/M3) or NVIDIA RTX 3060+ | 30-55 tok/sec |
| **Heavy / High Precision** | `llama3:70b`, `qwen2.5:32b` | 32 GB+ RAM | NVIDIA RTX 3090/4090 or Apple M-Max | 15-25 tok/sec |

> **Note on Cloud Mode**: If using **Mode B (Cloud/Online)** with Gemini or OpenAI, the application has minimal hardware requirements and will run smoothly on any machine with **2 GB RAM and a single-core CPU**.

---

## 4. Step-by-Step Installation Guide

### Step 1: Clone Repository & Create Virtual Environment

```bash
# Clone repository
git clone https://github.com/yourusername/kleinanzeigen-defekt-scraper.git
cd kleinanzeigen-defekt-scraper

# Create Python virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
```

### Step 2: Install Python Dependencies & Playwright Browsers

```bash
# Install core Python packages
pip install -r requirements.txt

# Install Playwright Chromium browser binary & OS dependencies
playwright install chromium
playwright install-deps
```

### Step 3: Set Up Local LLM (For Mode A - Full Local)

#### Option 1: Using Ollama (Recommended for Linux/macOS/Windows)
1. Download and install Ollama from [ollama.com](https://ollama.com/download).
2. Pull the recommended hardware analysis model:
   ```bash
   ollama pull llama3
   # or for smaller RAM footprints:
   ollama pull mistral
   ```
3. Start the Ollama local daemon:
   ```bash
   ollama serve
   # Test connectivity:
   curl http://localhost:11434/api/tags
   ```

#### Option 2: Using LM Studio (GUI-based for Windows/macOS)
1. Download and install [LM Studio](https://lmstudio.ai/).
2. Search and download a GGUF model (e.g. `Meta-Llama-3-8B-Instruct-GGUF`).
3. Navigate to the **Local Server** tab (`<->`), select the model, and click **Start Server** on port `1234`.

---

## 5. Configuration & Dual Execution Modes

Copy the example configuration file to `.env`:

```bash
cp .env.example .env
```

### Environment Variables Reference

```ini
# ==========================================
# Execution Mode Selection
# ==========================================
# 'local' = 100% offline (Playwright + Ollama/LM Studio + SQLite)
# 'cloud' = Online API models (Gemini / OpenAI)
EXECUTION_MODE="local"

# ==========================================
# Local LLM Parameters
# ==========================================
LOCAL_LLM_PROVIDER="ollama"             # 'ollama', 'lm_studio', 'localai'
LOCAL_LLM_ENDPOINT="http://localhost:11434"
LOCAL_LLM_MODEL="llama3"               # 'llama3', 'mistral', 'qwen2.5'
LOCAL_LLM_TIMEOUT_SEC="45"
FALLBACK_ON_LOCAL_FAILURE="true"       # Automatic fallback if local LLM server drops

# ==========================================
# Cloud API Credentials (Optional / Fallback)
# ==========================================
GEMINI_API_KEY=""                      # Required only if using Cloud Gemini
OPENAI_API_KEY=""                      # Required only if using Cloud OpenAI

# ==========================================
# Scraper & Location Parameters
# ==========================================
SCRAPER_LOCATION_NAME="dortmund"
SCRAPER_LOCATION_ID="2078"             # Kleinanzeigen Dortmund ID
SCRAPER_KEYWORDS="defekt,für Bastler,an Bastler,Ersatzteile"
SCRAPER_MAX_PAGES="2"
MIN_PROFIT_EUR="30.0"                  # Minimum flip profit margin
MAX_REPAIR_BUDGET="150.0"

# ==========================================
# Telegram Alerts (Optional)
# ==========================================
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""
```

---

## 6. How to Run

### 1. Run Automated 30-Second Smoke Test (Verification)
Before running production scrapes, verify all 4 subsystems:

```bash
# Run smoke test in local mode
python smoke_test.py --mode local

# Run smoke test in cloud mode
python smoke_test.py --mode cloud
```

### 2. Run Headless CLI Scraper
Executes a single extraction run, evaluates profitability, writes to SQLite, and alerts:

```bash
# Run in local LLM mode
python main.py --mode local

# Run in cloud LLM mode
python main.py --mode cloud

# Override keyword or page limit on the fly:
python main.py --keywords "kaffeemaschine defekt,ps5 defekt" --pages 3
```

### 3. Run Full-Stack Multi-User Web Application
Launches the Flask web dashboard with live SSE logs, settings configuration, and listing history:

```bash
python app.py
```
Open your browser and navigate to `http://localhost:5000`.

---

## 7. Automated Smoke Testing

The included `smoke_test.py` script validates the entire pipeline end-to-end within 30 seconds without triggering marketplace rate-limits:

```bash
python smoke_test.py
```

### What is Tested:
1. **Playwright Extraction**: Launches headless browser, navigates to a local mock HTML DOM, and tests CSS/XPath selectors.
2. **LLM Connectivity**: Connects to the active LLM endpoint (Ollama/LM Studio/Cloud) and validates the structured repair JSON schema.
3. **SQLite Database**: Tests schema migrations, user isolation, and foreign key integrity.
4. **Notification Dispatcher**: Performs a dry-run payload construction with dual URL formatting.

All outputs are written to `smoke_test.log`.

---

## 8. Troubleshooting & FAQ

### Q: Why do direct listing links say "Diese Anzeige ist leider nicht mehr verfügbar"?
**A**: Defective items with high flip margins (e.g. 20€ espresso machines or 50€ graphics cards) sell within minutes on Kleinanzeigen. 
* **The Solution**: Use the green **`🟢 Search Live`** button provided in the dashboard and Telegram alerts. It instantly queries active live listings in Dortmund (`k0l2078`) for similar deals.

### Q: How do I resolve Ollama connection timeouts?
**A**:
1. Check if Ollama is running: `curl http://localhost:11434/api/tags`
2. If using Docker, ensure host networking is enabled or use `http://host.docker.internal:11434`.
3. Increase `LOCAL_LLM_TIMEOUT_SEC=60` in `.env` if running large models on CPU.

### Q: Playwright fails with "Executable doesn't exist"?
**A**:
Run:
```bash
playwright install chromium
```
On Ubuntu/Debian Linux, install missing system shared libraries:
```bash
playwright install-deps
```

### Q: How does the scraper avoid getting blocked by anti-bot systems?
**A**:
* Uses realistic German browser headers (`Accept-Language: de-DE,de;q=0.9`).
* Injects randomized human jitter delays between page loads (1.5s - 3.8s).
* Supports optional rotating HTTP/SOCKS5 proxies via `SCRAPER_PROXY_URL`.

---

## 9. Directory Structure & Contributing

```
kleinanzeigen-defekt-scraper/
├── .env.example               # Environment template for Local & Cloud modes
├── README.md                  # Comprehensive GitHub documentation
├── requirements.txt           # Python dependency declarations
├── main.py                    # Core CLI scraping orchestrator
├── app.py                     # Multi-user Flask web server (port 5000)
├── local_llm_analyzer.py      # Unified Local & Cloud LLM analysis engine
├── smoke_test.py              # 30-second automated pipeline test suite
├── test_scraper.py            # Unit test suite (pytest)
├── availability_checker.py    # Real-time HTTP listing verification engine
├── scraper_worker.py          # Background Playwright task runner
├── models.py                  # SQLAlchemy database models
├── templates/                 # Jinja2 HTML templates for Web Dashboard
│   ├── base.html
│   ├── dashboard.html
│   ├── listings.html
│   └── settings.html
└── smoke_test.log             # Audit trail generated by smoke test
```

### Contributing
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Run the smoke test: `python smoke_test.py`.
4. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
5. Push to the Branch (`git push origin feature/AmazingFeature`).
6. Open a Pull Request.

---

### ⚖️ License
Distributed under the MIT License. See `LICENSE` for more information.
