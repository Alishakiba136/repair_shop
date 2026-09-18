#!/usr/bin/env python3
"""Simple test script to send a Telegram message using the repo helper.

Usage:
  python3 scripts/send_telegram_test.py "Hello from repair_shop"

Make sure `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set in your environment
or in the local `.env` before running.
"""
import sys
import os

# Ensure repo root is on sys.path so imports work when invoked from `scripts/`
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from telegram_notify import send_telegram_message


def main() -> int:
    msg = sys.argv[1] if len(sys.argv) > 1 else "Test message from repair_shop"
    try:
        result = send_telegram_message(text=msg)
        print("Message sent successfully:", result)
        return 0
    except Exception as exc:
        print("Failed to send message:", exc)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
