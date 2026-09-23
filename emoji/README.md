# HEHEARSE custom emoji

66 Telegram custom emoji (premium emoji), drawn to match the shop's own comic art: thin black ink lines, flat cel shading in muted greys, wine, teal and bone, faint paper grain, and one glowing peach accent with little spark dashes. The lettering and numbers use Concrete, the site's display font.

4 of them are animated (marked ▶ in the table below): the glowing heart, the flame, the shaker charm and the loading bar.

The set covers:
- **Hearts:** teal, bone, wine, glowing peach ▶, lavender, ink, broken, bandaged
- **Stars:** sparkles and stars
- **Tiny bullets for lists:** ✦ in teal, bone, wine and glowing peach; ★ in gold and lavender; a small heart; a double sparkle
- **Gothic:** blank polaroid, candle, rose, dagger, eye, fire ▶
- **Merch:** acrylic keychain, acrylic stand, postcard, shaker charm ▶, button pin, enamel pin, bag, parcel, price tag, envelope
- **Logo:** `HEHEARSE` + `.EXE`. Send the two side by side for the full wordmark on one line
- **Words:** `NEW`, `SOLD OUT`, `P.S.`, `МЕРЧ`, `!!`, `??`
- **Arrows and interface:** bold and thin arrows up, curly arrows, cursor, loading bar ▶, `.exe` window, ✓, ✗
- **Dividers:** a plain line and a line with a ✦. They run edge to edge, so sending several in a row makes one long line
- **Numbers:** 1–10

![Dark theme preview](preview-dark.png)
![Light theme preview](preview-light.png)
![Animated emoji](preview-anim.gif)

## Files

| Path | What |
| --- | --- |
| `png/*.png` | **Upload these** for the still emoji. 100×100 transparent PNGs |
| `anim/*.webm` | **Upload these** for the animated ones. 100×100 VP9 video, 2 s loop, each under the Bot API's 64 KB limit |
| `svg/*.svg` | Vector sources with the ink filter included (lettering needs the Concrete font from `../assets/fonts/`) |
| `designs.mjs` | The drawings and animations, written as code. Edit a shape, colour or motion here |
| `build.mjs` | Renders `designs.mjs` to all of the above plus the preview sheets |

To rebuild after changing something: `npm install && npm run build` in this folder. It needs Chromium (set `CHROME_PATH` if Playwright can't find one) and an ffmpeg with VP9 support (set `FFMPEG` if it isn't on your PATH).

## Publishing the pack in Telegram

The pack is live at **https://t.me/addemoji/hehearse_by_lin_forest_bot**.

To change the live pack, edit `designs.mjs`, run `npm run build`, then run `upload.mjs`. It brings the pack in line with `designs.mjs`:
- deletes emoji you removed
- replaces changed ones in place
- adds new ones
- reorders to match

```sh
TELEGRAM_BOT_TOKEN=<token> TELEGRAM_USER_ID=<your user id> npm run upload
```

`pack.json` records which live emoji is which design, so only what changed gets uploaded. Commit it after each run. For a brand-new pack, the owner has to message the bot once first. If `TELEGRAM_USER_ID` is left out, the script uses whoever messaged the bot last.

To do it by hand instead:

You don't need Premium to create a pack. To send the emoji in messages you need Premium, but everyone can see them, and channels can use them in posts.

1. Open [@Stickers](https://t.me/Stickers) and send `/newemojipack`.
2. Give the pack a name, e.g. `HEHEARSE`.
3. For each emoji, send its file **as a file** (not as a photo, which gets compressed): the `.webm` from `anim/` for the ▶ ones, otherwise the `.png`. Then send the matching regular emoji from the table below.
4. When you're done, send `/publish`. For the icon, send `png/sparkle_teal.png`. Then choose a short name: the pack will live at `t.me/addemoji/<short name>`.

Telegram has allowed still and animated emoji in the same pack since 2024. If @Stickers won't take a `.webm` in this pack, you have two options:
- make a second pack for the ▶ ones with `/newemojipack` → **Video emoji**
- upload their still `.png` versions instead

| # | File | Emoji | | # | File | Emoji |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `heart_teal` | 🩵 | | 34 | `shopping_bag` | 🛍 |
| 2 | `heart_bone` | 🤍 | | 35 | `parcel` | 📦 |
| 3 | `heart_wine` | ❤️ | | 36 | `price_tag` | 🏷 |
| 4 | `heart_peach_glow` ▶ | 🧡 | | 37 | `envelope` | ✉️ |
| 5 | `heart_lavender` | 💜 | | 38 | `logo_hehearse` | 🖤 |
| 6 | `heart_ink` | 🖤 | | 39 | `logo_exe` | 💻 |
| 7 | `heart_broken` | 💔 | | 40 | `word_new` | 🆕 |
| 8 | `heart_bandaged` | ❤️‍🩹 | | 41 | `word_sold_out` | 🚫 |
| 9 | `sparkle_teal` | ✨ | | 42 | `word_ps` | 📝 |
| 10 | `sparkle_outline` | ✨ | | 43 | `word_merch` | 🛒 |
| 11 | `sparkles_duo` | ✨ | | 44 | `exclaim` | ‼️ |
| 12 | `star_gold` | ⭐️ | | 45 | `question` | ❓ |
| 13 | `star_outline` | ⭐️ | | 46 | `arrow_up` | ⬆️ |
| 14 | `bullet_teal` | 🔹 | | 47 | `arrow_up_thin` | ⬆️ |
| 15 | `bullet_bone` | ▫️ | | 48 | `arrow_loop` | ⤵️ |
| 16 | `bullet_wine` | 🔸 | | 49 | `arrow_curly` | ➡️ |
| 17 | `bullet_peach_glow` | 🔸 | | 50 | `cursor` | 🖱 |
| 18 | `bullet_gold` | ⭐️ | | 51 | `loading` ▶ | ⏳ |
| 19 | `bullet_lavender` | ⭐️ | | 52 | `window_exe` | 🪟 |
| 20 | `bullet_heart` | ♥️ | | 53 | `check` | ✅ |
| 21 | `bullet_twin` | ✨ | | 54 | `cross` | ❌ |
| 22 | `polaroid` | 📸 | | 55 | `divider` | ➖ |
| 23 | `candle` | 🕯 | | 56 | `divider_sparkle` | ➖ |
| 24 | `rose` | 🌹 | | 57 | `num_1` | 1️⃣ |
| 25 | `dagger` | 🗡 | | 58 | `num_2` | 2️⃣ |
| 26 | `eye` | 👁 | | 59 | `num_3` | 3️⃣ |
| 27 | `fire` ▶ | 🔥 | | 60 | `num_4` | 4️⃣ |
| 28 | `acrylic_keychain` | 🔑 | | 61 | `num_5` | 5️⃣ |
| 29 | `acrylic_stand` | 🧍 | | 62 | `num_6` | 6️⃣ |
| 30 | `postcard` | 💌 | | 63 | `num_7` | 7️⃣ |
| 31 | `shaker_charm` ▶ | 🫧 | | 64 | `num_8` | 8️⃣ |
| 32 | `pin_badge` | 📍 | | 65 | `num_9` | 9️⃣ |
| 33 | `enamel_pin` | 📌 | | 66 | `num_10` | 🔟 |
