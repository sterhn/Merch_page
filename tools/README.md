# HEHEARSE Telegram Emoji Tools

Generate and bulk-upload custom Telegram emoji matching the site's aesthetic.

## Prerequisites

```bash
pip install Pillow cairosvg requests
```

## Step 1: Create a Telegram Bot

1. Open Telegram, find **@BotFather**
2. Send `/newbot`
3. Choose a name (e.g., "HEHEARSE Emoji Bot") and username (e.g., `hehearse_emoji_bot`)
4. Copy the bot token — looks like `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`

## Step 2: Get Your User ID

1. Find **@userinfobot** in Telegram and send it any message
2. It replies with your numeric user ID (e.g., `123456789`)

## Step 3: Start Your Bot

Send `/start` to your new bot in Telegram. This is required before the bot can create emoji sets for you.

## Step 4: Generate Emoji

```bash
cd tools/
python generate_emojis.py
```

This creates ~80 emoji PNGs in `tools/emojis/`:
- Cyrillic А–Я in Concrete font (teal)
- Numbers 0–9 (gold)
- Symbol icons from Majesticons (teal)
- Stars in all fandom colors
- Hearts, bullets, fandom markers

Preview what was generated:
```bash
python generate_emojis.py --preview
# Open tools/emojis/preview.html in a browser
```

## Step 5: Upload to Telegram

```bash
export TELEGRAM_BOT_TOKEN="your-token-here"
export TELEGRAM_USER_ID="your-id-here"
python upload_emojis.py
```

Or with arguments:
```bash
python upload_emojis.py --token "your-token" --user-id 123456789
```

Validate without uploading:
```bash
python upload_emojis.py --dry-run
```

## Step 6: Use Your Emoji

- The upload script prints the set URL: `https://t.me/addstickers/hehearse_emoji_by_yourbot`
- Open it in Telegram to add the set
- Find "HEHEARSE" in the emoji picker under your added sets
- Telegram Premium users can use custom emoji inline in messages

## Resuming Uploads

If the upload is interrupted, just run it again — it detects existing stickers and picks up where it left off.

To start over from scratch:
```bash
python upload_emojis.py --force
```

## Icons

Decorative icons are from [Majesticons](https://majesticons.com/) (MIT license).
