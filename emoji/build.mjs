// Renders every design in designs.mjs to:
//   svg/<id>.svg    – editable source (ink filter included; animated ones at frame 0)
//   png/<id>.png    – 100×100 transparent PNG for Telegram's @Stickers bot
//   anim/<id>.webm  – 100×100 VP9 video emoji for designs with `anim`
//   preview-dark.png / preview-light.png – the whole pack as a keyboard-style sheet
//   preview-anim.gif – the animated ones, playing
//
// Usage (from this folder):  npm install && npm run build
// Needs Chromium (set CHROME_PATH if Playwright can't find one) and an ffmpeg
// built with libvpx-vp9 (set FFMPEG if it isn't on PATH).

import { chromium } from 'playwright-core';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { designs } from './designs.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const RENDER = 400; // drawn at 4×, then downsampled to 100 for clean edges
const FPS = 30;
const SECONDS = 2; // Telegram allows up to 3 s per video emoji
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const MAX_KB = 60; // Bot API cap for video emoji is 64 KB; keep a little headroom

// Comic-ink look, matching the shop's artwork:
// - a slight wobble so lines feel hand-inked
// - a flat cel-shade crescent on the lower-right of every shape
// - faint paper grain inside the colour
// - a thin ink line around every silhouette
// - optionally a soft peach glow (the glowing pieces)
const inkFilter = (id, seed, { shade = true, glow = false, ink = true }) => `
  <filter id="${id}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="${seed}" result="warp"/>
    <feDisplacementMap in="SourceGraphic" in2="warp" scale="1.4" xChannelSelector="R" yChannelSelector="G" result="art"/>
    <feOffset in="art" dx="-3.5" dy="-4" result="shifted"/>
    <feComposite in="art" in2="shifted" operator="out" result="crescent"/>
    <feFlood flood-color="#151217" flood-opacity="${shade ? 0.3 : 0}"/>
    <feComposite in2="crescent" operator="in" result="shade"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="${seed + 5}" result="noise"/>
    <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.55 0 0 0 -0.2" result="speck"/>
    <feComposite in="speck" in2="art" operator="in" result="grain"/>
    <feGaussianBlur in="art" stdDeviation="1.25" result="soft"/>
    <feColorMatrix in="soft" type="matrix" values="0 0 0 0 0.08  0 0 0 0 0.07  0 0 0 0 0.09  0 0 0 ${ink ? '14 -1.3' : '0 0'}" result="line"/>
    <feGaussianBlur in="art" stdDeviation="4.5" result="haze"/>
    <feFlood flood-color="#f4c3ad" flood-opacity="${glow ? 0.9 : 0}"/>
    <feComposite in2="haze" operator="in" result="glow"/>
    <feMerge>
      <feMergeNode in="glow"/><feMergeNode in="line"/><feMergeNode in="art"/>
      <feMergeNode in="shade"/><feMergeNode in="grain"/>
    </feMerge>
  </filter>`;

const toSvg = (d, i, art) => {
  const u = `${d.id}-`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>${inkFilter(`${u}ink`, i * 13 + 3, d)}</defs>
  <g filter="url(#${u}ink)"><g transform="translate(50 50) scale(.92) translate(-50 -50)">${art(u)}</g></g>
</svg>
`;
};

for (const dir of ['svg', 'png', 'anim']) {
  await rm(join(here, dir), { recursive: true, force: true });
  await mkdir(join(here, dir), { recursive: true });
}

// Lettering uses the site's own display font
const font = (await readFile(join(here, '..', 'assets', 'fonts', 'concrete-regular.woff2'))).toString('base64');
const fontCss = `@font-face { font-family: 'Concrete'; src: url(data:font/woff2;base64,${font}) format('woff2'); }`;

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const page = await browser.newPage({ viewport: { width: RENDER, height: RENDER } });
await page.setContent(`<!doctype html><style>${fontCss} html,body{margin:0;background:transparent}
  svg{display:block;width:${RENDER}px;height:${RENDER}px}</style><div id="stage"></div>`);
await page.evaluate(() => document.fonts.load("40px 'Concrete'"));

// SVG → 100×100 PNG bytes
async function render(svg) {
  await page.evaluate((markup) => { document.getElementById('stage').innerHTML = markup; }, svg);
  const big = await page.locator('svg').screenshot({ omitBackground: true });
  // Downsample 400 → 200 → 100 in two halving steps (sharper than one jump).
  const small = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    let src = img;
    for (const size of [200, 100]) {
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(src, 0, 0, size, size);
      src = c;
    }
    return src.toDataURL('image/png').split(',')[1];
  }, big.toString('base64'));
  return Buffer.from(small, 'base64');
}

const tmp = await mkdtemp(join(tmpdir(), 'hehearse-emoji-'));
const frameCount = FPS * SECONDS;
const animated = designs.filter((d) => d.anim);

for (const [i, d] of designs.entries()) {
  const svg = toSvg(d, i, d.art);
  await writeFile(join(here, 'svg', `${d.id}.svg`), svg);
  await writeFile(join(here, 'png', `${d.id}.png`), await render(svg));

  if (!d.anim) continue;
  const frames = join(tmp, d.id);
  await mkdir(frames);
  for (let n = 0; n < frameCount; n++) {
    const png = await render(toSvg(d, i, (u) => d.anim(n / frameCount, u)));
    await writeFile(join(frames, `${String(n).padStart(3, '0')}.png`), png);
  }
  // The Bot API rejects video emoji over 64 KB, so raise the compression
  // until the file fits.
  const out = join(here, 'anim', `${d.id}.webm`);
  let kb = Infinity;
  for (let crf = 34; kb > MAX_KB && crf <= 63; crf += 4) {
    execFileSync(FFMPEG, [
      '-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(frames, '%03d.png'),
      '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', String(Math.min(crf, 63)),
      '-deadline', 'good', '-auto-alt-ref', '0', '-an', out,
    ]);
    kb = (await stat(out)).size / 1024;
  }
  if (kb > MAX_KB) console.warn(`  ${d.id}.webm is still ${kb.toFixed(0)} KB (limit ${MAX_KB} KB)`);
}

// Preview sheets: the pack laid out like Telegram's emoji keyboard.
const cols = 8;
const cell = 76;
const png64 = async (id) => (await readFile(join(here, 'png', `${id}.png`))).toString('base64');
for (const theme of ['dark', 'light']) {
  const bg = theme === 'dark' ? 'linear-gradient(160deg,#2b3446,#1d2331 60%,#221b2b)' : 'linear-gradient(160deg,#f4f1ec,#e9e3da)';
  const title = theme === 'dark' ? '#ede5da' : '#2b2233';
  const cells = await Promise.all(designs.map(async (d) => `<img src="data:image/png;base64,${await png64(d.id)}" width="60" height="60" alt="">`));
  const w = cols * cell + 48;
  await page.setViewportSize({ width: w, height: 400 });
  await page.setContent(`<!doctype html><style>${fontCss}
    body{margin:0;background:transparent}
    .kb{width:${w}px;box-sizing:border-box;padding:22px 24px 28px;border-radius:28px;background:${bg}}
    h1{font:30px Concrete;color:${title};margin:0 0 14px 6px;letter-spacing:.02em}
    h1 span{color:#6db5b2}
    .grid{display:grid;grid-template-columns:repeat(${cols},${cell}px);row-gap:8px}
    .grid img{justify-self:center}
    </style><div class="kb"><h1>HEHEARSE <span>✦</span> emoji</h1><div class="grid">${cells.join('')}</div></div>`);
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.kb').screenshot({ path: join(here, `preview-${theme}.png`), omitBackground: true });
}

// Animated preview: every animated emoji at 2× on the dark background, as a GIF.
if (animated.length) {
  const acols = Math.min(animated.length, 6);
  const size = 120;
  const sheet = join(tmp, 'sheet');
  await mkdir(sheet);
  for (let n = 0; n < frameCount; n++) {
    const srcs = await Promise.all(
      animated.map(async (d) =>
        (await readFile(join(tmp, d.id, `${String(n).padStart(3, '0')}.png`))).toString('base64')),
    );
    const b64 = await page.evaluate(async ({ srcs, acols, size }) => {
      const rows = Math.ceil(srcs.length / acols);
      const c = document.createElement('canvas');
      c.width = acols * size + 20;
      c.height = rows * size + 20;
      const ctx = c.getContext('2d');
      const g = ctx.createLinearGradient(0, 0, c.width, c.height);
      g.addColorStop(0, '#2b3446'); g.addColorStop(0.6, '#1d2331'); g.addColorStop(1, '#221b2b');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, c.width, c.height);
      for (const [k, s] of srcs.entries()) {
        const img = new Image();
        img.src = `data:image/png;base64,${s}`;
        await img.decode();
        ctx.drawImage(img, 10 + (k % acols) * size + 10, 10 + Math.floor(k / acols) * size + 10, size - 20, size - 20);
      }
      return c.toDataURL('image/png').split(',')[1];
    }, { srcs, acols, size });
    await writeFile(join(sheet, `${String(n).padStart(3, '0')}.png`), Buffer.from(b64, 'base64'));
  }
  execFileSync(FFMPEG, [
    '-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(sheet, '%03d.png'),
    '-filter_complex', '[0]split[a][b];[a]palettegen=max_colors=192[p];[b][p]paletteuse=dither=none',
    '-loop', '0', join(here, 'preview-anim.gif'),
  ]);
}

await rm(tmp, { recursive: true, force: true });
await browser.close();
console.log(`Rendered ${designs.length} emoji (${animated.length} animated).`);
