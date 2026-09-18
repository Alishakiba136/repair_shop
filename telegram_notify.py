import os
import requests
from typing import Any, Dict


def send_telegram_message(token: str | None = None, chat_id: str | None = None, text: str = "", parse_mode: str = "HTML") -> Dict[str, Any]:
    """Send a Telegram message using Bot API.

    Reads `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` from the environment when
    not provided. Raises ValueError if configuration is missing.
    """
    token = token or os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = chat_id or os.getenv("TELEGRAM_CHAT_ID")
    if not token or not chat_id:
        raise ValueError("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in environment")

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {"chat_id": chat_id, "text": text, "parse_mode": parse_mode}
    resp = requests.post(url, json=payload, timeout=15)
    resp.raise_for_status()
    return resp.json()
