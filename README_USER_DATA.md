# User Configuration Guide: Parameters, Credentials & Customization

This document outlines all configurable parameters, environment variables, credentials, and custom file paths that you (the user) can modify to tailor the scraper to your exact search targets, alert channels, and infrastructure.

---

## 1. Environment Variables & Credentials (`.env`)

You can create a `.env` file in the root folder based on `.env.example`.

### Sensitive & Custom Variables:

| Variable Name | Description | Default / Example Value | Where to Obtain |
| :--- | :--- | :--- | :--- |
| `TELEGRAM_BOT_TOKEN` | Optional token for receiving instant mobile alerts when new defective deals are found | `1234567890:ABCdefGhIJKlmNoPQRstuVWXyz` | Create a bot with [@BotFather](https://t.me/botfather) on Telegram |
| `TELEGRAM_CHAT_ID` | Your personal Telegram user ID or alert channel ID | `-1001234567890` or `12345678` | Obtain via [@userinfobot](https://t.me/userinfobot) on Telegram |
| `SCRAPER_PROXY_URL` | Optional HTTP/SOCKS5 rotating residential proxy | `http://user:pass@proxy.example.com:8080` | Your proxy provider (e.g., BrightData, Webshare) |
| `SCRAPER_KEYWORDS` | Comma-separated search queries | `defekt,für Bastler,Ersatzteile,an Bastler` | Custom user preference |
| `SCRAPER_LOCATION_NAME`| Target city name in URL slug | `dortmund` | Kleinanzeigen city slug |
| `SCRAPER_LOCATION_ID`  | Kleinanzeigen canonical numeric ID for target region | `2078` (Dortmund) | Found in Kleinanzeigen search URL path (`l2078`) |
| `SCRAPER_MAX_PAGES`    | Number of search pages to parse per keyword | `2` | Integer (1–10) |
| `HEADLESS_MODE`        | Run browser without GUI (`true` or `false`) | `true` | Boolean |

---

## 2. Parameter Customization in `main.py`

If you want to edit default constants directly inside `main.py`:

```python
# Lines 27 - 35 in main.py:

# 1. Search Terms: Add or remove targeted keywords
DEFAULT_KEYWORDS = [
    "defekt",          # Standard German term for 'broken/defective'
    "für Bastler",     # Standard German term for 'for hobbyists/tinkerers'
    "an Bastler",      # Common synonym
    "Ersatzteile"      # 'Spare parts'
]

# 2. Location Settings (Dortmund default):
DEFAULT_LOCATION_NAME = "Dortmund"
LOCATION_ID = "2078"  # Kleinanzeigen ID for Dortmund

# 3. File Output & Deduplication Paths:
LOG_FILE_PATH = "scraper_execution.log"
SEEN_IDS_FILE = "seen_listings.json"
OUTPUT_JSON_FILE = "extracted_defective_listings.json"

# 4. Scraping Limits:
MAX_PAGES_PER_KEYWORD = 2   # 1 page contains ~25-30 ads
PAGE_LOAD_TIMEOUT_MS = 30000 # 30 seconds
```

---

## 3. How to Find Other German City / Location IDs

To target other cities in North Rhine-Westphalia or Germany instead of Dortmund:
1. Go to [Kleinanzeigen.de](https://www.kleinanzeigen.de).
2. Enter your desired city in the location search bar (e.g. *Bochum*, *Essen*, *Köln*, *Berlin*).
3. Look at the resulting URL:
   - Example for Bochum: `https://www.kleinanzeigen.de/s-bochum/k0l1946` -> Location Name: `bochum`, Location ID: `1946`
   - Example for Essen: `https://www.kleinanzeigen.de/s-essen/k0l2028` -> Location Name: `essen`, Location ID: `2028`
   - Example for Köln: `https://www.kleinanzeigen.de/s-koeln/k0l945` -> Location Name: `koeln`, Location ID: `945`
4. Update `DEFAULT_LOCATION_NAME` and `LOCATION_ID` accordingly.

---

## 4. Telegram Notification Hook (Optional Add-on)

If you wish to send new listings straight to your smartphone via Telegram, add this helper to `main.py`:

```python
import os
import urllib.request
import urllib.parse

def send_telegram_alert(item: dict) -> None:
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    if not bot_token or not chat_id:
        return

    text = (
        f"🚨 *Neuer Bastler-Fund in {item['location']}!*\n\n"
        f"📌 *Titel:* {item['title']}\n"
        f"💰 *Preis:* {item['price']}\n"
        f"🔗 [Zur Anzeige]({item['item_url']})\n\n"
        f"📝 {item['description'][:150]}..."
    )
    
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = urllib.parse.urlencode({
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown",
        "disable_web_page_preview": "false"
    }).encode("utf-8")
    
    try:
        req = urllib.request.Request(url, data=payload, method="POST")
        with urllib.request.urlopen(req, timeout=5) as response:
            pass
    except Exception as err:
        print(f"Telegram notification error: {err}")
```
