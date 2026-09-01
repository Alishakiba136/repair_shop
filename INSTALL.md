# Installation & Setup Guide: Kleinanzeigen Defect Scraper

This guide walks you through setting up Python, Playwright, dependencies, and automated scheduling on Linux, macOS, or Windows.

---

## 1. Prerequisites

- **Python 3.9+** installed (`python3 --version` or `python --version`)
- **pip** (Python package installer)
- Git (optional, for cloning)

---

## 2. Step-by-Step Installation

### Step 2.1: Clone or Place Project Files
Ensure your project folder contains:
- `main.py`
- `test_scraper.py`
- `requirements.txt`
- `.env.example`

### Step 2.2: Create and Activate a Virtual Environment
Using a virtual environment prevents conflicts with system Python packages.

**On Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows (Command Prompt / PowerShell):**
```powershell
python -m venv venv
venv\Scripts\activate
```

### Step 2.3: Install Python Dependencies
Install the required packages from `requirements.txt`:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 2.4: Install Playwright Browser Binaries
Playwright requires browser binaries to operate. Download Chromium by running:
```bash
playwright install chromium
```

> **Note for Linux (Ubuntu/Debian) Server Users:**  
> If you run on a headless Linux server or Docker container and encounter missing system libraries, install the OS dependencies with:
> ```bash
> playwright install-deps chromium
> ```

---

## 3. Running the Scraper

### Default Headless Execution
Runs silently in the background:
```bash
python main.py
```

### Visual / Headful Debugging Mode
Opens a visible browser window so you can watch the navigation, anti-bot handling, and extraction in real time:
```bash
python main.py --headful
```

---

## 4. Running Verification Tests

Run the automated test suite using `pytest`:
```bash
pytest test_scraper.py -v
```

Or run the standalone test runner directly:
```bash
python test_scraper.py
```

---

## 5. Output Files Generated

Once executed, the scraper automatically produces:
1. `scraper_execution.log` – Complete execution log with timestamps, navigation status, and items found.
2. `seen_listings.json` – Set of listing IDs already processed (prevents duplicates in future runs).
3. `extracted_defective_listings.json` – Clean structured JSON list of all extracted items.

---

## 6. Automating with Cron (Linux / macOS)

To run the scraper automatically every 30 minutes, open your crontab:
```bash
crontab -e
```

Add the following line (adjusting paths to your actual directory):
```cron
*/30 * * * * cd /path/to/kleinanzeigen_scraper && /path/to/kleinanzeigen_scraper/venv/bin/python main.py >> /path/to/kleinanzeigen_scraper/cron.log 2>&1
```
