// Uploads the pack to Telegram as a custom emoji set through the Bot API.
//
//   TELEGRAM_BOT_TOKEN=123:abc node upload.mjs
//
// The set is owned by a Telegram user, who must have sent the bot a message
// first. Set TELEGRAM_USER_ID to choose them; otherwise the sender of the
// bot's latest private message is used. Optional: PACK_NAME (short name,
// gets "_by_<bot>" appended), PACK_TITLE.
//
// Safe to re-run: if the set already exists, it only adds what's missing.
// Run `npm run build` first so png/ and anim/ are current.

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { designs } from './designs.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error('Set TELEGRAM_BOT_TOKEN');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(method, params = {}, files = {}) {
  for (let attempt = 1; ; attempt++) {
    const body = new FormData();
    for (const [k, v] of Object.entries(params)) body.append(k, typeof v === 'string' ? v : JSON.stringify(v));
    for (const [k, { bytes, filename }] of Object.entries(files)) body.append(k, new Blob([bytes]), filename);
    // An empty multipart body gets rejected, so parameterless calls send none
    const empty = !Object.keys(params).length && !Object.keys(files).length;
    let res;
    try {
      res = await (await fetch(`https://api.telegram.org/bot${token}/${method}`, empty ? {} : { method: 'POST', body })).json();
    } catch (e) {
      // Dropped connections and empty replies: back off and try again
      if (attempt >= 5) throw e;
      console.log(`  ${method}: network error (${e.cause?.code || e.message}), retrying`);
      await sleep(2000 * attempt);
      continue;
    }
    if (res.ok) return res.result;
    if (res.error_code === 429) {
      const wait = (res.parameters?.retry_after ?? 5) + 1;
      console.log(`  rate limited, waiting ${wait}s`);
      await sleep(wait * 1000);
      continue;
    }
    const err = new Error(`${method}: ${res.description}`);
    err.description = res.description;
    throw err;
  }
}

const bot = await call('getMe');
let userId = process.env.TELEGRAM_USER_ID;
if (!userId) {
  const updates = await call('getUpdates');
  const msg = updates.map((u) => u.message).filter((m) => m?.chat?.type === 'private').at(-1);
  if (!msg) throw new Error(`Send any message to @${bot.username} first (or set TELEGRAM_USER_ID)`);
  userId = String(msg.from.id);
  console.log(`Owner: ${msg.from.first_name} (${userId})`);
}

const name = `${process.env.PACK_NAME || 'hehearse'}_by_${bot.username}`;
const title = process.env.PACK_TITLE || 'HEHEARSE';

async function input(d, i) {
  const video = Boolean(d.anim);
  const path = video ? join(here, 'anim', `${d.id}.webm`) : join(here, 'png', `${d.id}.png`);
  const field = `f${i}`;
  return {
    sticker: { sticker: `attach://${field}`, format: video ? 'video' : 'static', emoji_list: [d.emoji] },
    file: { [field]: { bytes: await readFile(path), filename: `${d.id}.${video ? 'webm' : 'png'}` } },
  };
}

let existing = 0;
try {
  existing = (await call('getStickerSet', { name })).stickers.length;
  console.log(`Set ${name} exists with ${existing} emoji`);
} catch (e) {
  if (!/STICKERSET_INVALID/.test(e.description)) throw e;
}

if (!existing) {
  // The first sticker creates the set; the rest are added one by one so a
  // failure part-way can resume on the next run.
  const first = await input(designs[0], 0);
  await call(
    'createNewStickerSet',
    { user_id: userId, name, title, sticker_type: 'custom_emoji', stickers: [first.sticker] },
    first.file,
  );
  existing = 1;
  console.log(`Created ${name}`);
}

for (let i = existing; i < designs.length; i++) {
  const { sticker, file } = await input(designs[i], i);
  await call('addStickerToSet', { user_id: userId, name, sticker }, file);
  console.log(`  ${i + 1}/${designs.length} ${designs[i].id}`);
}

// Pack icon: the teal sparkle
const set = await call('getStickerSet', { name });
const iconIndex = designs.findIndex((d) => d.id === 'sparkle_teal');
const icon = set.stickers[iconIndex]?.custom_emoji_id;
if (icon) await call('setCustomEmojiStickerSetThumbnail', { name, custom_emoji_id: icon });

console.log(`Done: ${set.stickers.length} emoji → https://t.me/addemoji/${name}`);
