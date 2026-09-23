// HEHEARSE custom emoji pack, in the style of the shop's own comic art:
// thin black ink lines, flat cel shading in muted tones, paper grain,
// and one glowing peach accent with little spark dashes.
//
// Every design is drawn on a 100×100 canvas. build.mjs adds the ink line,
// the cel-shade crescent, grain and glow, then renders to Telegram's 100×100.
// Per-design switches: `shade: false` for line art and lettering,
// `glow: true` for the glowing peach pieces, `ink: false` to skip the outline (keep it on for anything pale).

export const C = {
  bone: '#ddd6ca',
  greyL: '#aaa39a',
  grey: '#7e7870',
  greyD: '#4c4743',
  ink: '#151217',
  peach: '#f4c3ad',
  peachL: '#ffe3d6',
  peachD: '#d99a82',
  teal: '#5fa3a1',
  tealL: '#9ccfca',
  tealD: '#3a6d6c',
  wine: '#b05a73',
  wineL: '#d98ea3',
  wineD: '#6e3346',
  gold: '#cfa963',
  goldL: '#e8cf98',
  goldD: '#9a7a45',
  lav: '#9186b8',
  lavD: '#5e5580',
  moss: '#7c9477',
  shine: '#ffffff',
};

// Stroke / fill helpers
const s = (d, c, w = 6.5, x = '') =>
  `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${x}/>`;
const f = (d, c, x = '') => `<path d="${d}" fill="${c}" ${x}/>`;
const dot = (cx, cy, r, c, x = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" ${x}/>`;
const ring = (cx, cy, r, c, w = 6.5) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
// Lettering uses Concrete, the site's display face
const txt = (t, x, y, size, c, x2 = '') =>
  `<text x="${x}" y="${y}" font-family="Concrete" font-size="${size}" fill="${c}" text-anchor="middle" ${x2}>${t}</text>`;
const line = (d, w = 2.2) => s(d, C.ink, w); // inner ink detail lines

// Shapes
const HEART = 'M50 86 C26 70 10 54 12 36 C14 20 34 14 50 30 C66 14 86 20 88 36 C90 54 74 70 50 86 Z';
const heartIcon = (cx, cy, k, c) =>
  `<g transform="translate(${cx} ${cy}) scale(${k}) translate(-50 -50)">${f(HEART, c)}</g>`;
const sparkle = (cx, cy, r, k = 0.14) => {
  const a = r * k;
  return `M${cx} ${cy - r} Q${cx + a} ${cy - a} ${cx + r} ${cy} Q${cx + a} ${cy + a} ${cx} ${cy + r} Q${cx - a} ${cy + a} ${cx - r} ${cy} Q${cx - a} ${cy - a} ${cx} ${cy - r} Z`;
};
const burst = (cx, cy, R, r, n, rot = -90) => {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const ang = ((rot + (i * 180) / n) * Math.PI) / 180;
    const rad = i % 2 ? r : R;
    d += `${i ? 'L' : 'M'}${(cx + rad * Math.cos(ang)).toFixed(1)} ${(cy + rad * Math.sin(ang)).toFixed(1)} `;
  }
  return d + 'Z';
};
const star = (cx, cy, R, r, rot = -90) => burst(cx, cy, R, r, 5, rot);
const filledStar = (d, c, w = 5) => f(d, c, `stroke="${c}" stroke-width="${w}" stroke-linejoin="round"`);
const glint = (d, w = 3.5) => s(d, C.shine, w);
const blush = (cx, cy) => s(`M${cx - 5} ${cy + 2} L${cx - 2} ${cy - 2} M${cx} ${cy + 2} L${cx + 3} ${cy - 2} M${cx + 5} ${cy + 2} L${cx + 8} ${cy - 2}`, C.wine, 1.8);
// The little radiating dash marks from the glowing-thread drawings
const sparks = (cx, cy, r1, r2, n = 8, c = C.peach, w = 2.6, rot = 0) => {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = ((rot + (i * 360) / n) * Math.PI) / 180;
    d += `M${(cx + r1 * Math.cos(a)).toFixed(1)} ${(cy + r1 * Math.sin(a)).toFixed(1)} L${(cx + r2 * Math.cos(a)).toFixed(1)} ${(cy + r2 * Math.sin(a)).toFixed(1)} `;
  }
  return s(d, c, w);
};
// Big glossy comic tear
const tear = (cx, cy, k = 1) =>
  `<g transform="translate(${cx} ${cy}) scale(${k})">` +
  f('M0 -12 C5 -3 8 3 8 7 C8 12 4 15 0 15 C-4 15 -8 12 -8 7 C-8 3 -5 -3 0 -12 Z', C.tealL) +
  s('M-3.5 5 C-3.5 3 -2.5 1 -1.5 -1', C.shine, 2) + `</g>`;
const HEART_GLINT = 'M24 36 C24 30 28 26 34 25';

const GHOST = 'M26 88 L26 46 C26 24 37 12 50 12 C63 12 74 24 74 46 L74 88 L66 80 L58 88 L50 80 L42 88 L34 80 Z';

export const designs = [
  // ── Hearts ─────────────────────────────────────────────
  { id: 'heart_teal', emoji: '🩵', art: () => f(HEART, C.teal) + glint(HEART_GLINT) },
  { id: 'heart_bone', emoji: '🤍', art: () => f(HEART, C.bone) + glint(HEART_GLINT) },
  { id: 'heart_wine', emoji: '❤️', art: () => f(HEART, C.wine) + glint(HEART_GLINT) },
  { id: 'heart_peach_glow', emoji: '🧡', glow: true, art: () => f(HEART, C.peach) + glint(HEART_GLINT) + sparks(50, 52, 44, 50, 10, C.peach, 2.4, 18) },
  { id: 'heart_lavender', emoji: '💜', art: () => f(HEART, C.lav) + glint(HEART_GLINT) },
  { id: 'heart_ink', emoji: '🖤', art: () => f(HEART, C.greyD) + glint(HEART_GLINT) },
  {
    id: 'heart_broken',
    emoji: '💔',
    art: (u) =>
      `<defs><mask id="${u}m"><rect width="100" height="100" fill="#fff"/>${s('M50 24 L42 42 L56 52 L44 68 L50 90', '#000', 5)}</mask></defs>` +
      `<g mask="url(#${u}m)">${f(HEART, C.wine)}</g>` + glint(HEART_GLINT),
  },
  {
    id: 'heart_bandaged',
    emoji: '❤️‍🩹',
    art: () =>
      f(HEART, C.wineD) +
      `<g transform="rotate(-32 50 48)"><rect x="18" y="40" width="64" height="18" rx="9" fill="${C.bone}"/>` +
      `<rect x="40" y="40" width="20" height="18" fill="${C.greyL}"/>` +
      dot(46, 46, 1.5, C.greyD) + dot(54, 46, 1.5, C.greyD) + dot(46, 52, 1.5, C.greyD) + dot(54, 52, 1.5, C.greyD) +
      `</g>`,
  },

  // ── Stars & sky ────────────────────────────────────────
  { id: 'sparkle_teal', emoji: '✨', art: () => f(sparkle(50, 50, 44), C.teal) + glint('M47 24 L49 16', 3) },
  { id: 'sparkle_outline', emoji: '✨', shade: false, art: () => s(sparkle(50, 50, 40, 0.2), C.bone, 5) },
  {
    id: 'sparkles_duo',
    emoji: '✨',
    art: () => f(sparkle(38, 40, 30), C.gold) + f(sparkle(74, 74, 18), C.bone),
  },
  { id: 'star_gold', emoji: '⭐️', art: () => filledStar(star(50, 53, 42, 19), C.gold, 6) + glint('M36 44 L44 42') },
  { id: 'star_outline', emoji: '⭐️', shade: false, art: () => s(star(50, 54, 40, 17, -94), C.wine, 5.5) },
  {
    id: 'stars_cluster',
    emoji: '🌟',
    art: () =>
      filledStar(star(34, 36, 22, 10), C.lav, 4) +
      filledStar(star(70, 44, 16, 7, -80), C.bone, 4) +
      filledStar(star(46, 74, 16, 7, -100), C.teal, 4),
  },
  {
    id: 'moon',
    emoji: '🌙',
    art: () =>
      f('M60 10 C34 12 16 32 16 56 C16 76 34 92 56 90 C70 89 82 82 88 70 C62 76 42 60 42 38 C42 26 50 16 60 10 Z', C.bone) +
      line('M30 58 C32 64 36 66 40 66 M26 44 L32 46') +
      f(sparkle(74, 32, 12), C.gold) + dot(86, 52, 3, C.gold),
  },
  {
    id: 'shooting_star',
    emoji: '🌠',
    art: () =>
      s('M10 66 L46 44 M14 82 L50 58 M28 92 L56 72', C.greyL, 4) +
      filledStar(star(68, 38, 26, 12, -80), C.gold),
  },

  // ── Tiny star bullets (for lists) ──────────────────────
  { id: 'bullet_teal', emoji: '🔹', shade: false, art: () => f(sparkle(50, 50, 20, 0.12), C.teal) },
  { id: 'bullet_bone', emoji: '▫️', shade: false, art: () => f(sparkle(50, 50, 20, 0.12), C.bone) },
  { id: 'bullet_wine', emoji: '🔸', shade: false, art: () => f(sparkle(50, 50, 20, 0.12), C.wine) },
  { id: 'bullet_peach_glow', emoji: '🔸', shade: false, glow: true, art: () => f(sparkle(50, 50, 18, 0.12), C.peach) + sparks(50, 50, 24, 29, 8, C.peach, 2.2, 22) },
  { id: 'bullet_gold', emoji: '⭐️', shade: false, art: () => filledStar(star(50, 52, 19, 8.5), C.gold, 4) },
  { id: 'bullet_lavender', emoji: '⭐️', shade: false, art: () => filledStar(star(50, 52, 19, 8.5), C.lav, 4) },
  { id: 'bullet_heart', emoji: '♥️', shade: false, art: () => heartIcon(50, 52, 0.42, C.wine) },
  {
    id: 'bullet_twin',
    emoji: '✨',
    shade: false,
    art: () => f(sparkle(44, 46, 17, 0.12), C.teal) + f(sparkle(64, 64, 9, 0.12), C.bone),
  },

  // ── From the artwork: glow, tears, smoke ───────────────
  {
    id: 'yarn_glow',
    emoji: '🧶',
    glow: true,
    art: () =>
      dot(52, 52, 30, C.peach) +
      s('M30 36 C44 30 62 40 70 56 M26 52 C40 44 60 52 66 72 M36 76 C44 62 60 56 80 54 M44 24 C48 42 44 64 34 78 M58 24 C64 40 62 62 52 82', C.peachD, 2) +
      s('M24 60 C14 66 12 80 4 84', C.peach, 2.6) +
      sparks(52, 52, 36, 42, 10, C.peach, 2.2, 10),
  },
  {
    id: 'thread_glow',
    emoji: '🧵',
    glow: true,
    shade: false,
    art: () => s('M4 60 C20 40 30 70 46 50 C58 36 66 60 78 46 L96 40', C.peach, 4) + sparks(46, 50, 7, 13, 7, C.peach, 2, 5),
  },
  { id: 'spark', emoji: '💥', glow: true, shade: false, art: () => sparks(50, 50, 16, 40, 9, C.peach, 4.5, 8) + dot(50, 50, 5, C.peachL) },
  { id: 'tear', emoji: '💧', art: () => tear(50, 52, 3) },
  {
    id: 'tears_face',
    emoji: '🥲',
    art: () =>
      dot(50, 50, 40, C.bone) +
      line('M28 42 C32 38 38 38 42 42 M58 42 C62 38 68 38 72 42', 3) +
      line('M40 70 C46 64 54 64 60 70', 3) +
      tear(34, 56, 0.95) + tear(66, 56, 0.95) + blush(28, 64) + blush(66, 64),
  },
  {
    id: 'smoke',
    emoji: '🌫',
    art: () =>
      f('M30 92 C18 84 22 70 32 68 C22 60 26 44 40 46 C34 34 44 22 56 28 C60 16 78 18 78 32 C90 34 90 50 80 54 C88 62 82 76 70 74 C74 86 60 94 50 86 C44 94 36 94 30 92 Z', C.grey) +
      f('M44 80 C36 76 38 66 46 66 C42 58 48 50 56 54 C58 46 68 46 70 54 C76 58 74 68 66 68 C68 76 60 82 54 78 C52 82 48 82 44 80 Z', C.greyD) +
      line('M34 80 C38 78 38 74 36 72 M60 36 C64 36 66 40 64 42 M50 60 C52 58 55 60 54 62 M74 64 C72 62 70 64 72 66 M40 54 C42 50 46 52 44 56'),
  },
  {
    id: 'polaroid',
    emoji: '📸',
    art: () =>
      `<g transform="rotate(-8 50 50)">` +
      `<rect x="18" y="10" width="64" height="78" rx="2" fill="${C.bone}"/>` +
      `<rect x="24" y="16" width="52" height="50" fill="${C.greyD}"/>` +
      heartIcon(50, 42, 0.38, C.peach) + sparks(50, 42, 16, 20, 8, C.peach, 1.8, 20) +
      line('M24 16 L76 16 L76 66 L24 66 Z', 2) + `</g>`,
  },
  {
    id: 'id_badge',
    emoji: '🪪',
    art: () =>
      s('M30 4 L46 26 M70 4 L54 26', C.wineD, 5) +
      `<rect x="44" y="22" width="12" height="8" rx="2" fill="${C.greyD}"/>` +
      `<rect x="24" y="28" width="52" height="66" rx="5" fill="${C.bone}"/>` +
      `<rect x="36" y="38" width="28" height="28" fill="${C.greyD}"/>` +
      f(sparkle(50, 52, 10), C.teal) +
      `<rect x="40" y="36" width="20" height="4" rx="2" fill="${C.grey}"/>` +
      line('M34 76 L66 76 M34 84 L56 84'),
  },
  {
    id: 'mask',
    emoji: '🎭',
    art: () =>
      f('M8 40 C20 30 36 34 50 42 C64 34 80 30 92 40 C94 54 86 68 72 68 C62 68 56 60 50 56 C44 60 38 68 28 68 C14 68 6 54 8 40 Z', C.greyD) +
      `<ellipse cx="30" cy="50" rx="10" ry="8" fill="${C.bone}"/><ellipse cx="70" cy="50" rx="10" ry="8" fill="${C.bone}"/>` +
      dot(31, 51, 3.2, C.ink) + dot(69, 51, 3.2, C.ink) +
      tear(84, 78, 0.8),
  },

  // ── Gothic ─────────────────────────────────────────────
  {
    id: 'ghost',
    emoji: '👻',
    art: () =>
      f(GHOST, C.bone) +
      `<ellipse cx="41" cy="46" rx="4.5" ry="6" fill="${C.ink}"/><ellipse cx="59" cy="46" rx="4.5" ry="6" fill="${C.ink}"/>` +
      dot(42.5, 43.5, 1.5, C.shine) + dot(60.5, 43.5, 1.5, C.shine) +
      blush(30, 56) + blush(62, 56) + line('M46 58 C48 61 52 61 54 58'),
  },
  {
    id: 'ghost_love',
    emoji: '🥰',
    art: () =>
      f(GHOST, C.bone) +
      line('M36 46 L41 41 L46 46 M54 46 L59 41 L64 46', 3) +
      blush(30, 55) + blush(62, 55) +
      heartIcon(50, 70, 0.36, C.wine) + heartIcon(86, 20, 0.22, C.wine),
  },
  {
    id: 'ghost_cry',
    emoji: '😭',
    art: () =>
      f(GHOST, C.bone) +
      line('M34 44 C38 40 42 40 46 44 M54 44 C58 40 62 40 66 44', 3) +
      line('M44 62 C47 58 53 58 56 62', 2.6) +
      tear(38, 56, 0.8) + tear(62, 56, 0.8),
  },
  {
    id: 'candle',
    emoji: '🕯',
    glow: true,
    art: () =>
      f('M32 44 L68 44 L68 88 L32 88 Z', C.bone) +
      f('M32 44 L68 44 L68 54 C66 60 62 60 62 54 C62 64 56 66 56 56 C54 60 50 60 50 54 L32 54 Z', C.shine) +
      line('M50 44 L50 36', 2.6) +
      f('M50 8 C58 18 62 26 58 32 C55 37 45 37 42 32 C38 26 42 18 50 8 Z', C.peach) +
      f('M50 20 C54 25 55 29 53 32 C51 34 49 34 47 32 C45 29 46 25 50 20 Z', C.peachL) +
      s('M22 90 L78 90', C.greyD, 5),
  },
  {
    id: 'rose',
    emoji: '🌹',
    art: () =>
      s('M50 62 L50 94', C.moss, 5) +
      f('M50 80 C40 70 28 72 24 76 C32 84 42 84 50 80 Z M50 86 C60 76 72 78 76 82 C68 90 58 90 50 86 Z', C.moss) +
      f('M50 12 C66 10 78 22 76 38 C76 54 64 62 50 62 C36 62 24 54 24 38 C22 22 34 10 50 12 Z', C.wine) +
      line('M50 38 C54 34 58 40 54 44 C48 50 40 42 44 34 C48 26 62 28 64 38 C66 50 54 56 44 54 M26 42 C32 52 40 56 50 56 M74 42 C70 50 64 54 58 56', 2.4),
  },
  {
    id: 'dagger',
    emoji: '🗡',
    art: () =>
      `<g transform="rotate(28 50 50)">` +
      f('M50 96 L42 46 L58 46 Z', C.bone) + line('M50 50 L50 86') +
      f('M44 22 L56 22 L56 40 L44 40 Z', C.wineD) +
      `<rect x="26" y="38" width="48" height="9" rx="4.5" fill="${C.gold}"/>` +
      heartIcon(50, 15, 0.2, C.gold) +
      `</g>`,
  },
  {
    id: 'eye',
    emoji: '👁',
    art: () =>
      f('M8 54 C28 26 72 26 92 54 C72 78 28 78 8 54 Z', C.bone) +
      dot(50, 53, 15, C.teal) + dot(50, 53, 6.5, C.ink) + dot(55, 48, 3, C.shine) +
      line('M50 12 L50 22 M24 20 L30 28 M76 20 L70 28', 3),
  },
  {
    id: 'fire',
    emoji: '🔥',
    glow: true,
    art: () =>
      f('M50 8 C58 24 76 32 78 56 C80 76 66 92 50 92 C34 92 20 80 22 60 C23 46 32 40 36 30 C40 40 42 44 46 44 C44 32 44 20 50 8 Z', C.wine) +
      f('M50 48 C56 58 64 64 62 76 C60 84 56 88 50 88 C43 88 38 82 38 74 C38 64 46 60 50 48 Z', C.peach),
  },

  // ── Merch ──────────────────────────────────────────────
  {
    id: 'shopping_bag',
    emoji: '🛍',
    art: () =>
      s('M36 40 C36 12 64 12 64 40', C.greyD, 5) +
      f('M20 36 L80 36 L86 90 L14 90 Z', C.teal) +
      dot(36, 44, 3, C.ink) + dot(64, 44, 3, C.ink) +
      f(sparkle(50, 66, 14), C.bone),
  },
  {
    id: 'parcel',
    emoji: '📦',
    art: () =>
      f('M14 38 L50 50 L50 92 L14 78 Z', C.gold) +
      f('M50 50 L86 38 L86 78 L50 92 Z', C.goldD) +
      f('M14 38 L50 24 L86 38 L50 50 Z', C.goldL) +
      line('M14 38 L50 50 L86 38 M50 50 L50 92') +
      s('M32 31 L68 44 L68 60', C.bone, 5) +
      heartIcon(32, 62, 0.22, C.wine),
  },
  {
    id: 'price_tag',
    emoji: '🏷',
    art: (u) =>
      `<defs><mask id="${u}h"><rect width="100" height="100" fill="#fff"/>${dot(70, 28, 6.5, '#000')}</mask></defs>` +
      s('M70 28 C80 16 88 10 96 8', C.bone, 3) +
      `<g mask="url(#${u}h)">` +
      f('M52 12 L84 12 C86 12 88 14 88 16 L88 46 L46 88 C43 91 39 91 36 88 L12 64 C9 61 9 57 12 54 Z', C.wine) +
      `</g>` + heartIcon(48, 54, 0.26, C.bone),
  },
  {
    id: 'pin_badge',
    emoji: '📍',
    art: () =>
      dot(50, 50, 42, C.bone) + dot(50, 50, 33, C.teal) + ring(50, 50, 33, C.ink, 2) +
      f(sparkle(50, 50, 22), C.bone) +
      glint('M22 36 C26 26 34 18 44 15', 4),
  },
  {
    id: 'keychain',
    emoji: '🔑',
    art: () =>
      ring(50, 12, 8, C.greyL, 4) +
      s('M50 20 L50 26 M50 30 L50 34', C.greyL, 4) +
      `<g transform="translate(50 64) scale(.72) translate(-50 -50)">` +
      f(HEART, C.lav) + `</g>` +
      glint('M30 56 C31 50 35 46 40 45', 4),
  },
  {
    id: 'sticker',
    emoji: '🎨',
    art: () =>
      f('M20 12 L80 12 C85 12 88 15 88 20 L88 62 L62 88 L20 88 C15 88 12 85 12 80 L12 20 C12 15 15 12 20 12 Z', C.moss) +
      f('M88 62 L62 88 L66 66 Z', C.bone) + line('M88 62 L66 66 L62 88') +
      f(sparkle(44, 46, 20), C.bone) + dot(66, 30, 3.5, C.bone),
  },
  {
    id: 'envelope',
    emoji: '💌',
    art: () =>
      `<rect x="10" y="26" width="80" height="54" rx="4" fill="${C.bone}"/>` +
      line('M12 30 L50 58 L88 30', 2.4) +
      heartIcon(50, 58, 0.3, C.wine),
  },
  {
    id: 'paper_plane',
    emoji: '✈️',
    art: () =>
      f('M8 46 L92 12 L68 84 L48 62 Z', C.bone) +
      f('M92 12 L48 62 L44 84 L56 70 Z', C.greyL) +
      line('M92 12 L48 62') +
      s('M28 76 C20 82 14 90 6 90', C.peach, 2.4, 'stroke-dasharray="4 5"'),
  },

  // ── Lettering (site font) ──────────────────────────────
  {
    id: 'word_new',
    emoji: '🆕',
    shade: false,
    art: () => f(burst(50, 50, 46, 34, 12), C.gold) + txt('NEW', 50, 61, 33, C.ink),
  },
  {
    id: 'word_sold_out',
    emoji: '🚫',
    shade: false,
    art: () =>
      `<g transform="rotate(-12 50 50)">` +
      `<rect x="6" y="24" width="88" height="52" rx="4" fill="${C.wine}"/>` +
      `<rect x="11" y="29" width="78" height="42" rx="2" fill="none" stroke="${C.bone}" stroke-width="2"/>` +
      txt('SOLD', 50, 50, 24, C.bone) + txt('OUT', 50, 68, 20, C.bone) + `</g>`,
  },
  {
    id: 'word_hehe',
    emoji: '😆',
    shade: false,
    art: () => txt('HEHE', 50, 70, 40, C.teal) + s('M22 30 L27 37 M50 18 L50 27 M78 30 L73 37', C.peach, 3),
  },
  { id: 'word_exe', emoji: '💻', shade: false, art: () => txt('.EXE', 50, 64, 44, C.teal) },
  { id: 'word_ps', emoji: '📝', shade: false, art: () => txt('P.S.', 50, 66, 52, C.bone) },
  {
    id: 'word_merch',
    emoji: '🛒',
    shade: false,
    art: () => txt('МЕРЧ', 50, 60, 38, C.wineL) + s('M8 76 L92 76', C.teal, 3) + f(sparkle(50, 76, 7), C.teal),
  },
  {
    id: 'exclaim',
    emoji: '‼️',
    art: () =>
      f('M26 12 L42 12 L37 62 L31 62 Z', C.wine, `stroke="${C.wine}" stroke-width="4" stroke-linejoin="round"`) +
      dot(34, 80, 7, C.wine) +
      f('M58 12 L74 12 L69 62 L63 62 Z', C.gold, `stroke="${C.gold}" stroke-width="4" stroke-linejoin="round"`) +
      dot(66, 80, 7, C.gold),
  },
  {
    id: 'question',
    emoji: '❓',
    shade: false,
    art: () =>
      s('M14 32 C14 18 42 16 42 32 C42 42 30 44 30 56', C.gold, 7) + dot(30, 76, 5.5, C.gold) +
      s('M56 32 C56 18 84 16 84 32 C84 42 72 44 72 56', C.teal, 7) + dot(72, 76, 5.5, C.teal),
  },

  // ── Arrows & interface ─────────────────────────────────
  {
    id: 'arrow_up',
    emoji: '⬆️',
    art: () =>
      f('M50 6 L88 46 L64 46 C64 62 62 78 60 94 L40 94 C38 78 36 62 36 46 L12 46 Z', C.teal) +
      glint('M44 20 L30 36', 3),
  },
  {
    id: 'arrow_up_thin',
    emoji: '⬆️',
    shade: false,
    art: () => s('M50 92 C44 70 56 50 50 12', C.bone, 5) + s('M32 30 L50 10 L68 30', C.bone, 5),
  },
  {
    id: 'arrow_loop',
    emoji: '⤵️',
    shade: false,
    art: () =>
      s('M18 16 C60 8 82 30 64 46 C50 58 30 46 42 34 C54 24 72 44 62 84', C.teal, 5) +
      s('M48 74 L62 86 L72 72', C.teal, 5),
  },
  {
    id: 'arrow_curly',
    emoji: '➡️',
    shade: false,
    art: () => s('M8 62 C24 30 46 80 64 50 L88 46', C.gold, 5) + s('M76 34 L90 46 L78 58', C.gold, 5),
  },
  {
    id: 'cursor',
    emoji: '🖱',
    art: () =>
      f('M26 10 L26 78 L42 64 L54 90 L66 85 L54 60 L76 60 Z', C.bone) +
      f(sparkle(80, 22, 11), C.teal),
  },
  {
    id: 'loading',
    emoji: '⏳',
    shade: false,
    art: () =>
      `<rect x="8" y="38" width="84" height="26" rx="3" fill="${C.greyD}"/>` +
      `<rect x="15" y="45" width="12" height="12" fill="${C.teal}"/><rect x="31" y="45" width="12" height="12" fill="${C.teal}"/>` +
      `<rect x="47" y="45" width="12" height="12" fill="${C.teal}"/>` +
      dot(34, 80, 3, C.bone) + dot(50, 80, 3, C.bone) + dot(66, 80, 3, C.bone, 'opacity=".5"'),
  },
  {
    id: 'window_exe',
    emoji: '🪟',
    art: () =>
      `<rect x="10" y="16" width="80" height="68" rx="3" fill="${C.greyD}"/>` +
      `<rect x="10" y="16" width="80" height="18" rx="3" fill="${C.bone}"/>` +
      dot(21, 25, 3, C.wine) + dot(31, 25, 3, C.gold) + dot(41, 25, 3, C.teal) +
      line('M10 34 L90 34') +
      heartIcon(50, 60, 0.34, C.peach),
  },
  {
    id: 'check',
    emoji: '✅',
    shade: false,
    art: () => dot(50, 50, 40, C.teal) + s('M32 52 L45 64 L70 36', C.bone, 7),
  },
  {
    id: 'cross',
    emoji: '❌',
    shade: false,
    art: () => dot(50, 50, 40, C.wine) + s('M36 36 L64 64 M64 36 L36 64', C.bone, 7),
  },
  {
    id: 'bow',
    emoji: '🎀',
    art: () =>
      f('M50 44 C38 24 12 24 14 42 C16 58 38 54 50 44 C62 54 84 58 86 42 C88 24 62 24 50 44 Z', C.greyD) +
      s('M47 48 L32 86 M53 48 L68 86', C.greyD, 7) + dot(50, 45, 8, C.ink),
  },
  {
    id: 'music',
    emoji: '🎶',
    art: () =>
      s('M36 74 L36 22 L80 12 L80 64 M36 34 L80 24', C.lav, 6) +
      `<ellipse cx="26" cy="76" rx="12" ry="9" fill="${C.lav}" transform="rotate(-18 26 76)"/>` +
      `<ellipse cx="70" cy="66" rx="12" ry="9" fill="${C.lav}" transform="rotate(-18 70 66)"/>`,
  },
  {
    id: 'divider',
    emoji: '➖',
    shade: false,
    art: () =>
      s('M4 50 L34 50 M66 50 L96 50', C.teal, 3.5) + f(sparkle(50, 50, 13), C.teal) +
      dot(40, 50, 2.5, C.bone) + dot(60, 50, 2.5, C.bone),
  },

  // ── Numbers for lists (site font) ──────────────────────
  ...['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map((n, i) => {
    const [fill, digit] = [
      [C.wine, C.bone],
      [C.bone, C.ink],
      [C.teal, C.ink],
      [C.greyD, C.bone],
    ][i % 4];
    return {
      id: `num_${n}`,
      emoji: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'][i],
      shade: false,
      art: () => dot(50, 50, 40, fill) + txt(n, 50, 66, n.length > 1 ? 44 : 52, digit),
    };
  }),
];
