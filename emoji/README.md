# HEHEARSE custom emoji

79 static Telegram custom emoji (premium emoji), drawn to match the shop's own comic art: thin black ink lines, flat cel shading in muted greys, wine, teal and bone, faint paper grain, and one glowing peach accent with little spark dashes. The lettering and numbers use Concrete, the site's display font.

The set covers:
- **Hearts:** teal, bone, wine, glowing peach, lavender, ink, broken, bandaged
- **Stars and sky:** sparkles, stars, moon, shooting star
- **Tiny bullets for lists:** ✦ in teal, bone, wine and glowing peach; ★ in gold and lavender; a small heart; a double sparkle
- **Motifs from the artwork:** glowing yarn ball, glowing thread, spark, glossy tear, crying face, smoke, polaroid, ID badge, domino mask
- **Gothic:** ghosts (plain, in love, crying), candle, rose, dagger, eye, fire
- **Merch:** bag, parcel, price tag, pin badge, keychain, sticker, envelope, paper plane
- **Words:** `NEW`, `SOLD OUT`, `HEHE`, `.EXE`, `P.S.`, `МЕРЧ`, `!!`, `??`
- **Arrows and interface:** bold and thin arrows up, curly arrows, cursor, loading bar, `.exe` window, ✓, ✗, bow, music, divider
- **Numbers:** 1–10

![Dark theme preview](preview-dark.png)
![Light theme preview](preview-light.png)

## Files

| Path | What |
| --- | --- |
| `png/*.png` | **Upload these.** 100×100 transparent PNGs, the size Telegram needs for static emoji |
| `svg/*.svg` | Vector sources with the ink filter included (lettering needs the Concrete font from `../assets/fonts/`) |
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
| 1 | `heart_teal` | 🩵 | | 41 | `fire` | 🔥 |
| 2 | `heart_bone` | 🤍 | | 42 | `shopping_bag` | 🛍 |
| 3 | `heart_wine` | ❤️ | | 43 | `parcel` | 📦 |
| 4 | `heart_peach_glow` | 🧡 | | 44 | `price_tag` | 🏷 |
| 5 | `heart_lavender` | 💜 | | 45 | `pin_badge` | 📍 |
| 6 | `heart_ink` | 🖤 | | 46 | `keychain` | 🔑 |
| 7 | `heart_broken` | 💔 | | 47 | `sticker` | 🎨 |
| 8 | `heart_bandaged` | ❤️‍🩹 | | 48 | `envelope` | 💌 |
| 9 | `sparkle_teal` | ✨ | | 49 | `paper_plane` | ✈️ |
| 10 | `sparkle_outline` | ✨ | | 50 | `word_new` | 🆕 |
| 11 | `sparkles_duo` | ✨ | | 51 | `word_sold_out` | 🚫 |
| 12 | `star_gold` | ⭐️ | | 52 | `word_hehe` | 😆 |
| 13 | `star_outline` | ⭐️ | | 53 | `word_exe` | 💻 |
| 14 | `stars_cluster` | 🌟 | | 54 | `word_ps` | 📝 |
| 15 | `moon` | 🌙 | | 55 | `word_merch` | 🛒 |
| 16 | `shooting_star` | 🌠 | | 56 | `exclaim` | ‼️ |
| 17 | `bullet_teal` | 🔹 | | 57 | `question` | ❓ |
| 18 | `bullet_bone` | ▫️ | | 58 | `arrow_up` | ⬆️ |
| 19 | `bullet_wine` | 🔸 | | 59 | `arrow_up_thin` | ⬆️ |
| 20 | `bullet_peach_glow` | 🔸 | | 60 | `arrow_loop` | ⤵️ |
| 21 | `bullet_gold` | ⭐️ | | 61 | `arrow_curly` | ➡️ |
| 22 | `bullet_lavender` | ⭐️ | | 62 | `cursor` | 🖱 |
| 23 | `bullet_heart` | ♥️ | | 63 | `loading` | ⏳ |
| 24 | `bullet_twin` | ✨ | | 64 | `window_exe` | 🪟 |
| 25 | `yarn_glow` | 🧶 | | 65 | `check` | ✅ |
| 26 | `thread_glow` | 🧵 | | 66 | `cross` | ❌ |
| 27 | `spark` | 💥 | | 67 | `bow` | 🎀 |
| 28 | `tear` | 💧 | | 68 | `music` | 🎶 |
| 29 | `tears_face` | 🥲 | | 69 | `divider` | ➖ |
| 30 | `smoke` | 🌫 | | 70 | `num_1` | 1️⃣ |
| 31 | `polaroid` | 📸 | | 71 | `num_2` | 2️⃣ |
| 32 | `id_badge` | 🪪 | | 72 | `num_3` | 3️⃣ |
| 33 | `mask` | 🎭 | | 73 | `num_4` | 4️⃣ |
| 34 | `ghost` | 👻 | | 74 | `num_5` | 5️⃣ |
| 35 | `ghost_love` | 🥰 | | 75 | `num_6` | 6️⃣ |
| 36 | `ghost_cry` | 😭 | | 76 | `num_7` | 7️⃣ |
| 37 | `candle` | 🕯 | | 77 | `num_8` | 8️⃣ |
| 38 | `rose` | 🌹 | | 78 | `num_9` | 9️⃣ |
| 39 | `dagger` | 🗡 | | 79 | `num_10` | 🔟 |
| 40 | `eye` | 👁 | |  | |  |
