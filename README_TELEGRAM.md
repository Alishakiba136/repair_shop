# Telegram notification setup

Steps to enable Telegram notifications for this project:

1. Create a Telegram bot
   - Message [@BotFather](https://t.me/BotFather) and follow the steps to create a new bot.
   - Save the bot token (format: `123456:ABC-DEF...`).

2. Obtain your chat id
   - You can use [@userinfobot](https://t.me/userinfobot) or send a message to your bot and call the `getUpdates` endpoint to find the chat id.

3. Configure environment variables (preferred)
   - Add the following to your local `.env` (this file is ignored by git):

```
TELEGRAM_BOT_TOKEN="<your-bot-token-here>"
TELEGRAM_CHAT_ID="<your-chat-id-here>"
```

4. Test the connection
   - From the project root run:

```bash
python3 scripts/send_telegram_test.py "Hello from repair_shop"
```

5. Rotate the token if it was previously exposed
   - If your token was exposed, revoke it in BotFather and create a new one, then update your `.env`.

Security notes
 - Do NOT commit tokens or secrets to the repository. Use `.env` and ensure `.gitignore` contains `.env`.
 - Consider storing production secrets in a secure secrets manager.
