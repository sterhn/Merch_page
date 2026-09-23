// Uploads the pack to Telegram as a custom emoji set through the Bot API,
// or brings an existing set in line with designs.mjs:
//   - designs that were removed are deleted from the set
//   - designs whose file changed are replaced in place
//   - new designs are added
//   - the set is reordered to match designs.mjs
//
//   TELEGRAM_BOT_TOKEN=123:abc node upload.mjs
//
// The set is owned by a Telegram user, who must have sent the bot a message
// first. Set TELEGRAM_USER_ID to choose them; otherwise the sender of the
// bot's latest private message is used. Optional: PACK_NAME (short name,
// gets "_by_<bot>" appended), PACK_TITLE.
//
// pack.json records which live emoji is which design (and a hash of the file
// that was uploaded), so re-runs only touch what changed. Commit it.
// Run `npm run build` first so png/ and anim/ are current.

import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
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
const manifestPath = join(here, 'pack.json');

async function input(d) {
  const video = Boolean(d.anim);
  const path = video ? join(here, 'anim', `${d.id}.webm`) : join(here, 'png', `${d.id}.png`);
  const bytes = await readFile(path);
  return {
    sticker: { sticker: 'attach://file', format: video ? 'video' : 'static', emoji_list: [d.emoji] },
    file: { file: { bytes, filename: `${d.id}.${video ? 'webm' : 'png'}` } },
    sha256: createHash('sha256').update(bytes).digest('hex').slice(0, 16),
  };
}

const getSet = async () => {
  try {
    return await call('getStickerSet', { name });
  } catch (e) {
    if (/STICKERSET_INVALID/.test(e.description)) return null;
    throw e;
  }
};

let manifest = { name, stickers: {} };
try {
  manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
} catch {}
if (manifest.name !== name) manifest = { name, stickers: {} };
const save = () => writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

let set = await getSet();
if (!set) {
  const first = await input(designs[0]);
  await call('createNewStickerSet', { user_id: userId, name, title, sticker_type: 'custom_emoji', stickers: [first.sticker] }, first.file);
  set = await getSet();
  manifest = { name, stickers: { [designs[0].id]: { custom_emoji_id: set.stickers[0].custom_emoji_id, sha256: first.sha256 } } };
  await save();
  console.log(`Created ${name}`);
}

const live = () => new Map(set.stickers.map((s, i) => [s.custom_emoji_id, { ...s, position: i }]));
const wanted = new Set(designs.map((d) => d.id));

// 1. Delete emoji whose design is gone
for (const [id, entry] of Object.entries(manifest.stickers)) {
  if (wanted.has(id)) continue;
  const s = live().get(entry.custom_emoji_id);
  if (s) {
    await call('deleteStickerFromSet', { sticker: s.file_id });
    set = await getSet();
    console.log(`  deleted ${id}`);
  }
  delete manifest.stickers[id];
  await save();
}

// 2. Replace changed emoji in place, add new ones
for (const d of designs) {
  const next = await input(d);
  const entry = manifest.stickers[d.id];
  const current = entry && live().get(entry.custom_emoji_id);
  if (current && entry.sha256 === next.sha256) continue;
  if (current) {
    await call('replaceStickerInSet', { user_id: userId, name, old_sticker: current.file_id, sticker: next.sticker }, next.file);
    set = await getSet();
    manifest.stickers[d.id] = { custom_emoji_id: set.stickers[current.position].custom_emoji_id, sha256: next.sha256 };
    console.log(`  replaced ${d.id}`);
  } else {
    await call('addStickerToSet', { user_id: userId, name, sticker: next.sticker }, next.file);
    set = await getSet();
    manifest.stickers[d.id] = { custom_emoji_id: set.stickers.at(-1).custom_emoji_id, sha256: next.sha256 };
    console.log(`  added ${d.id}`);
  }
  await save();
}

// 3. Put everything in designs.mjs order
for (const [i, d] of designs.entries()) {
  const s = live().get(manifest.stickers[d.id].custom_emoji_id);
  if (s.position === i) continue;
  await call('setStickerPositionInSet', { sticker: s.file_id, position: i });
  set = await getSet();
}

// Pack icon: the teal sparkle
const icon = manifest.stickers.sparkle_teal?.custom_emoji_id;
if (icon) await call('setCustomEmojiStickerSetThumbnail', { name, custom_emoji_id: icon });

console.log(`Done: ${set.stickers.length} emoji → https://t.me/addemoji/${name}`);
