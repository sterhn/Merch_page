// Renders every design in designs.mjs to:
//   svg/<id>.svg   – editable source (chalk filter included)
//   png/<id>.png   – 100×100 transparent PNG, ready for Telegram's @Stickers bot
//   preview-dark.png / preview-light.png – the whole pack in a keyboard-style sheet
//
// Usage (from this folder):  npm install && npm run build
// Set CHROME_PATH if Playwright can't find a Chromium on its own.

import { chromium } from 'playwright-core';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { designs } from './designs.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const RENDER = 400; // drawn at 4×, then downsampled to 100 for clean edges

// Chalk look: a low-frequency displacement makes lines wobble like a hand
// drew them, a high-frequency grain mask eats small holes into the colour,
// and a thin rim keeps light shapes visible on light chat backgrounds.
const chalkFilter = (id, seed) => `
  <filter id="${id}" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${seed}" result="warp"/>
    <feDisplacementMap in="SourceGraphic" in2="warp" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="wobbly"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="${seed + 7}" result="noise"/>
    <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3.2 0 0 0 -0.45" result="grain"/>
    <feComposite in="wobbly" in2="grain" operator="in" result="chalky"/>
    <!-- Soft plum rim so cream shapes still read on Telegram's light theme -->
    <feMorphology in="wobbly" operator="dilate" radius="1.4" result="fat"/>
    <feComposite in="fat" in2="wobbly" operator="out" result="ring"/>
    <feFlood flood-color="#4a3d55" flood-opacity=".6"/>
    <feComposite in2="ring" operator="in" result="rim"/>
    <feMerge><feMergeNode in="rim"/><feMergeNode in="chalky"/></feMerge>
  </filter>`;

const toSvg = (d, i) => {
  const u = `${d.id}-`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>${chalkFilter(`${u}chalk`, i * 13 + 3)}</defs>
  <g filter="url(#${u}chalk)">${d.art(u)}</g>
</svg>
`;
};

await mkdir(join(here, 'svg'), { recursive: true });
await mkdir(join(here, 'png'), { recursive: true });

const svgs = designs.map(toSvg);
await Promise.all(designs.map((d, i) => writeFile(join(here, 'svg', `${d.id}.svg`), svgs[i])));

const font = (await readFile(join(here, 'fonts', 'caveat-bold.ttf'))).toString('base64');
const fontCss = `@font-face { font-family: 'Caveat'; font-weight: 700; src: url(data:font/ttf;base64,${font}) format('truetype'); }`;

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const page = await browser.newPage({ viewport: { width: RENDER, height: RENDER } });
await page.setContent(`<!doctype html><style>${fontCss} html,body{margin:0;background:transparent}
  svg{display:block;width:${RENDER}px;height:${RENDER}px}</style><div id="stage"></div>`);

for (const [i, d] of designs.entries()) {
  await page.evaluate((svg) => { document.getElementById('stage').innerHTML = svg; }, svgs[i]);
  await page.evaluate(() => document.fonts.ready);
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
  await writeFile(join(here, 'png', `${d.id}.png`), Buffer.from(small, 'base64'));
}

// Preview sheets: the pack laid out like Telegram's emoji keyboard.
const cols = 8;
const cell = 76;
for (const theme of ['dark', 'light']) {
  const bg = theme === 'dark' ? 'linear-gradient(160deg,#2b3446,#1d2331 60%,#221b2b)' : 'linear-gradient(160deg,#f4f1ec,#e9e3da)';
  const title = theme === 'dark' ? '#ede5da' : '#2b2233';
  const cells = await Promise.all(
    designs.map(async (d) => {
      const b64 = (await readFile(join(here, 'png', `${d.id}.png`))).toString('base64');
      return `<img src="data:image/png;base64,${b64}" width="60" height="60" alt="">`;
    }),
  );
  const w = cols * cell + 48;
  await page.setViewportSize({ width: w, height: 400 });
  await page.setContent(`<!doctype html><style>${fontCss}
    body{margin:0;background:transparent}
    .kb{width:${w}px;box-sizing:border-box;padding:22px 24px 28px;border-radius:28px;background:${bg}}
    h1{font:700 30px Caveat;color:${title};margin:0 0 14px 6px;letter-spacing:.02em}
    h1 span{color:#6db5b2}
    .grid{display:grid;grid-template-columns:repeat(${cols},${cell}px);row-gap:8px}
    .grid img{justify-self:center}
    </style><div class="kb"><h1>HEHEARSE <span>✦</span> emoji</h1><div class="grid">${cells.join('')}</div></div>`);
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.kb').screenshot({ path: join(here, `preview-${theme}.png`), omitBackground: true });
}

await browser.close();
console.log(`Rendered ${designs.length} emoji.`);
