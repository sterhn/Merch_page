# HEHEARSE custom emoji

64 static Telegram custom emoji (premium emoji) in the shop's palette: plum-night background, cream, teal ✦, dusty rose, gold and lavender. They're drawn to look like chalk or crayon, like the packs people already use. They're made for Telegram posts: hearts and sparkles, spooky-cute ghosts, cats and a coffin (the *hearse* in HEHEARSE), merch (bag, parcel, price tag, pin badge, acrylic keychain, sticker), shop words (`new`, `SOLD OUT`, `hehe`, `.exe`, `P.S.`, `мерч`), interface bits and numbers 1–10 for lists.

![Dark theme preview](preview-dark.png)
![Light theme preview](preview-light.png)

Every emoji has a thin plum rim, so the cream ones stay readable on Telegram's light theme too.

## Files

| Path | What |
| --- | --- |
| `png/*.png` | **Upload these.** 100×100 transparent PNGs, the size Telegram needs for static emoji |
| `svg/*.svg` | Vector sources with the chalk filter included (word emoji use the Caveat font from `fonts/`) |
| `designs.mjs` | The drawings, written as code. Edit a shape or colour here |
| `build.mjs` | Renders `designs.mjs` to `svg/`, `png/` and the two preview sheets |

To rebuild after changing something: `npm install && npm run build` in this folder. If Playwright can't find a browser, set `CHROME_PATH` to a Chrome/Chromium executable.

## Publishing the pack in Telegram

You don't need Premium to create a pack. To send the emoji in messages you need Premium, but everyone can see them, and channels can use them in posts.

1. Open [@Stickers](https://t.me/Stickers) and send `/newemojipack`.
2. Choose **Static emoji** and give the pack a name, e.g. `HEHEARSE`.
3. For each emoji, send the PNG **as a file** (not as a photo, which gets compressed), then send the matching regular emoji from the table below.
4. When you're done, send `/publish`. For the icon, send `png/sparkle_teal.png`. Then choose a short name: the pack will live at `t.me/addemoji/<short name>`.

| # | File | Emoji | | # | File | Emoji |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `heart_teal` | 🩵 | | 33 | `word_new` | 🆕 |
| 2 | `heart_cream` | 🤍 | | 34 | `word_sold_out` | 🚫 |
| 3 | `heart_rose` | 🩷 | | 35 | `word_hehe` | 😆 |
| 4 | `heart_gold` | 💛 | | 36 | `word_exe` | 💻 |
| 5 | `heart_lavender` | 💜 | | 37 | `word_ps` | 📝 |
| 6 | `heart_broken` | 💔 | | 38 | `exclaim` | ‼️ |
| 7 | `heart_bandaged` | ❤️‍🩹 | | 39 | `question` | ❓ |
| 8 | `hearts_burst` | 💕 | | 40 | `word_merch` | 🛒 |
| 9 | `sparkle_teal` | ✨ | | 41 | `cursor` | 🖱 |
| 10 | `sparkle_outline` | ✨ | | 42 | `loading` | ⏳ |
| 11 | `sparkles_duo` | ✨ | | 43 | `window_exe` | 🪟 |
| 12 | `star_gold` | ⭐️ | | 44 | `arrow_loop` | ⤵️ |
| 13 | `star_outline` | ⭐️ | | 45 | `arrow_curly` | ➡️ |
| 14 | `stars_cluster` | 🌟 | | 46 | `bow` | 🎀 |
| 15 | `moon` | 🌙 | | 47 | `check` | ✅ |
| 16 | `shooting_star` | 🌠 | | 48 | `cross` | ❌ |
| 17 | `ghost` | 👻 | | 49 | `paw` | 🐾 |
| 18 | `ghost_love` | 🥰 | | 50 | `crown` | 👑 |
| 19 | `ghost_cry` | 😭 | | 51 | `music` | 🎶 |
| 20 | `coffin` | ⚰️ | | 52 | `eye` | 👁 |
| 21 | `candle` | 🕯 | | 53 | `fire` | 🔥 |
| 22 | `bat` | 🦇 | | 54 | `divider` | ➖ |
| 23 | `cat_happy` | 😸 | | 55 | `num_1` | 1️⃣ |
| 24 | `cat_cry` | 😿 | | 56 | `num_2` | 2️⃣ |
| 25 | `shopping_bag` | 🛍 | | 57 | `num_3` | 3️⃣ |
| 26 | `parcel` | 📦 | | 58 | `num_4` | 4️⃣ |
| 27 | `price_tag` | 🏷 | | 59 | `num_5` | 5️⃣ |
| 28 | `pin_badge` | 📍 | | 60 | `num_6` | 6️⃣ |
| 29 | `keychain` | 🔑 | | 61 | `num_7` | 7️⃣ |
| 30 | `sticker` | 🎨 | | 62 | `num_8` | 8️⃣ |
| 31 | `envelope` | 💌 | | 63 | `num_9` | 9️⃣ |
| 32 | `paper_plane` | ✈️ | | 64 | `num_10` | 🔟 |

Font: [Caveat](https://github.com/googlefonts/caveat), SIL Open Font License (`fonts/OFL.txt`).
