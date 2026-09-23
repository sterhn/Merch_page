// HEHEARSE custom emoji pack, in the style of the shop's own comic art:
// thin black ink lines, flat cel shading in muted tones, paper grain,
// and one glowing peach accent with little spark dashes.
//
// Every design is drawn on a 100×100 canvas. build.mjs adds the ink line,
// the cel-shade crescent, grain and glow, then renders to Telegram's 100×100.
// Per-design switches: `shade: false` for line art and lettering,
// `glow: true` for the glowing peach pieces, `ink: false` to skip the outline
// (keep it on for anything pale).
//
// Animated designs define `anim(t, u)` instead of `art(u)`: t runs 0 → 1 over
// one loop and must come back to where it started. `art` then defaults to
// frame t = `still` (0 unless set), which is also the still PNG.

export const C = {
  bone: '#ddd6ca',
  greyL: '#aaa39a',
  grey: '#7e7870',
  greyD: '#4c4743',
  ink: '#151217',
  photo: '#1e1a21',
  peach: '#f4c3ad',
  peachL: '#ffe3d6',
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
const rect = (x, y, w, h, rx, c, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${c}" ${extra}/>`;
// Lettering uses Concrete, the site's display face
const txt = (t, x, y, size, c, x2 = '') =>
  `<text x="${x}" y="${y}" font-family="Concrete" font-size="${size}" fill="${c}" text-anchor="middle" ${x2}>${t}</text>`;
const line = (d, w = 2.2) => s(d, C.ink, w); // inner ink detail lines
// Scale / rotate a group around a point
const tr = (cx, cy, k, rot, inner) =>
  `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${k}) translate(${-cx} ${-cy})">${inner}</g>`;

// Looping motion helpers (t in 0..1)
const TAU = Math.PI * 2;
const wave = (t, phase = 0) => Math.sin(TAU * (t + phase));
// A pop that swells up and fades once per loop, peaking at `at`
const pop = (t, at, width = 0.22) => {
  let d = Math.abs(((t - at + 1.5) % 1) - 0.5);
  return d > width ? 0 : Math.cos((d / width) * (Math.PI / 2)) ** 2;
};

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
// The little radiating dash marks from the glowing-thread drawings
const sparks = (cx, cy, r1, r2, n = 8, c = C.peach, w = 2.6, rot = 0, x = '') => {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = ((rot + (i * 360) / n) * Math.PI) / 180;
    d += `M${(cx + r1 * Math.cos(a)).toFixed(1)} ${(cy + r1 * Math.sin(a)).toFixed(1)} L${(cx + r2 * Math.cos(a)).toFixed(1)} ${(cy + r2 * Math.sin(a)).toFixed(1)} `;
  }
  return s(d, c, w, x);
};
// A tiny white twinkle that pops in and out
const twinkle = (cx, cy, r, amount) =>
  amount > 0.02 ? f(sparkle(cx, cy, r * amount, 0.1), C.shine) : '';
const HEART_GLINT = 'M24 36 C24 30 28 26 34 25';

// The site header's shimmer gradient (#c8b8a8 → #f0e8de → teal → #f0e8de → #c8b8a8),
// split across the two logo tiles so they read as one wordmark side by side.
const logoGradient = (id, stops) =>
  `<defs><linearGradient id="${id}" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">` +
  stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('') +
  `</linearGradient></defs>`;

// Fire, anchored at its base so it can sway and stretch
const FLAME_OUT =
  'M50 8 C58 24 76 32 78 56 C80 76 66 92 50 92 C34 92 20 80 22 60 C23 46 32 40 36 30 C40 40 42 44 46 44 C44 32 44 20 50 8 Z';
const FLAME_IN = 'M50 48 C56 58 64 64 62 76 C60 84 56 88 50 88 C43 88 38 82 38 74 C38 64 46 60 50 48 Z';
const flame = (t) => {
  const sway = 5 * wave(t);
  const stretch = 1 + 0.05 * wave(t, 0.25) + 0.03 * wave(2 * t);
  const swayIn = -7 * wave(t, 0.15);
  const stretchIn = 1 + 0.1 * wave(2 * t, 0.3);
  const embers = [0, 0.5]
    .map((ph, i) => {
      const p = (t + ph) % 1;
      const y = 26 - 26 * p;
      const x = 50 + (i ? 12 : -10) + 4 * Math.sin(TAU * p);
      const r = 3 * (1 - p);
      return r > 0.3 ? dot(x.toFixed(1), y.toFixed(1), r.toFixed(2), C.peach) : '';
    })
    .join('');
  return (
    `<g transform="translate(50 92) skewX(${sway.toFixed(2)}) scale(1 ${stretch.toFixed(3)}) translate(-50 -92)">` +
    f(FLAME_OUT, C.wine) +
    `<g transform="translate(50 88) skewX(${swayIn.toFixed(2)}) scale(1 ${stretchIn.toFixed(3)}) translate(-50 -88)">` +
    f(FLAME_IN, C.peach) +
    `</g></g>` +
    embers
  );
};

// Acrylic shaker charm: the little bits inside jiggle around
const shakerBits = (t) => {
  const bits = [
    [38, 50, 'star', C.gold, 0],
    [60, 44, 'heart', C.wineL, 0.2],
    [50, 64, 'spark', C.tealL, 0.45],
    [64, 64, 'dot', C.peach, 0.6],
    [36, 68, 'dot', C.bone, 0.8],
    [48, 40, 'dot', C.lav, 0.35],
  ];
  return bits
    .map(([x, y, kind, c, ph]) => {
      const dx = 3.5 * wave(t, ph);
      const dy = 4 * wave(2 * t, ph + 0.1);
      const rot = 25 * wave(t, ph + 0.3);
      const X = x + dx;
      const Y = y + dy;
      if (kind === 'star') return tr(X, Y, 1, rot, filledStar(star(X, Y, 7, 3), c, 2));
      if (kind === 'heart') return tr(X, Y, 1, rot, heartIcon(X, Y, 0.16, c));
      if (kind === 'spark') return tr(X, Y, 1, rot, f(sparkle(X, Y, 7), c));
      return dot(X.toFixed(1), Y.toFixed(1), 2.6, c);
    })
    .join('');
};

// Sky pieces, animated (static PNG = frame 0)
const twinkleStar = (t) =>
  tr(50, 52, 1 + 0.1 * wave(t), 6 * wave(t, 0.25), filledStar(star(50, 53, 30, 13.5), C.gold, 5) + glint('M40 46 L46 44', 3)) +
  twinkle(76, 26, 10, pop(t, 0.35)) + twinkle(26, 74, 8, pop(t, 0.8));

export const designs = [
  // ── Hearts ─────────────────────────────────────────────
  { id: 'heart_teal', emoji: '🩵', art: () => f(HEART, C.teal) + glint(HEART_GLINT) },
  { id: 'heart_bone', emoji: '🤍', art: () => f(HEART, C.bone) + glint(HEART_GLINT) },
  { id: 'heart_wine', emoji: '❤️', art: () => f(HEART, C.wine) + glint(HEART_GLINT) },
  {
    id: 'heart_peach_glow',
    emoji: '🧡',
    glow: true,
    anim: (t) =>
      tr(50, 52, 1 + 0.05 * wave(t), 0, f(HEART, C.peach) + glint(HEART_GLINT)) +
      sparks(50, 52, 43 + 3 * wave(t), 49 + 3 * wave(t), 10, C.peach, 2.4, 18 + 36 * t),
  },
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
      `<g transform="rotate(-32 50 48)">` + rect(18, 40, 64, 18, 9, C.bone) + rect(40, 40, 20, 18, 0, C.greyL) +
      dot(46, 46, 1.5, C.greyD) + dot(54, 46, 1.5, C.greyD) + dot(46, 52, 1.5, C.greyD) + dot(54, 52, 1.5, C.greyD) +
      `</g>`,
  },

  // ── Stars & sky (animated) ─────────────────────────────
  {
    id: 'sparkle_teal',
    emoji: '✨',
    anim: (t) =>
      tr(50, 50, 1 + 0.12 * wave(t), 8 * wave(t, 0.25), f(sparkle(50, 50, 32), C.teal) + glint('M48 30 L49 25', 2.6)) +
      twinkle(78, 24, 9, pop(t, 0.3)) + twinkle(24, 76, 7, pop(t, 0.75)),
  },
  {
    id: 'sparkle_outline',
    emoji: '✨',
    shade: false,
    anim: (t) => tr(50, 50, 1 + 0.1 * wave(2 * t), 90 * t, s(sparkle(50, 50, 29, 0.2), C.bone, 4.5)),
  },
  {
    id: 'sparkles_duo',
    emoji: '✨',
    anim: (t) =>
      tr(40, 42, 1 + 0.14 * wave(t), 0, f(sparkle(40, 42, 22), C.gold)) +
      tr(70, 70, 1 + 0.2 * wave(t, 0.5), 0, f(sparkle(70, 70, 13), C.bone)),
  },
  { id: 'star_gold', emoji: '⭐️', anim: twinkleStar },
  {
    id: 'star_outline',
    emoji: '⭐️',
    shade: false,
    anim: (t) => tr(50, 53, 1 + 0.08 * wave(t, 0.25), 12 * wave(t), s(star(50, 54, 28, 12, -94), C.wine, 5)),
  },
  {
    id: 'stars_cluster',
    emoji: '🌟',
    anim: (t) =>
      tr(38, 38, 1 + 0.15 * wave(t), 0, filledStar(star(38, 38, 16, 7), C.lav, 3.5)) +
      tr(66, 46, 1 + 0.15 * wave(t, 1 / 3), 0, filledStar(star(66, 46, 11, 5, -80), C.bone, 3.5)) +
      tr(48, 68, 1 + 0.15 * wave(t, 2 / 3), 0, filledStar(star(48, 68, 11, 5, -100), C.teal, 3.5)),
  },
  {
    id: 'moon',
    emoji: '🌙',
    anim: (t) =>
      f('M60 10 C34 12 16 32 16 56 C16 76 34 92 56 90 C70 89 82 82 88 70 C62 76 42 60 42 38 C42 26 50 16 60 10 Z', C.bone) +
      line('M30 58 C32 64 36 66 40 66') +
      tr(74, 32, 0.8 + 0.25 * wave(t), 10 * wave(t, 0.25), f(sparkle(74, 32, 10), C.gold)),
  },
  {
    id: 'shooting_star',
    emoji: '🌠',
    anim: (t) =>
      s('M14 70 L44 52 M18 84 L48 66 M32 92 L54 78', C.greyL, 3.5, `stroke-dasharray="10 8" stroke-dashoffset="${(-36 * t).toFixed(2)}"`) +
      tr(64, 42, 1 + 0.08 * wave(t), 10 * wave(t), filledStar(star(64, 42, 19, 8.5, -80), C.gold, 4)),
  },

  // ── Tiny star bullets (for lists) ──────────────────────
  { id: 'bullet_teal', emoji: '🔹', shade: false, art: () => f(sparkle(50, 50, 16, 0.12), C.teal) },
  { id: 'bullet_bone', emoji: '▫️', shade: false, art: () => f(sparkle(50, 50, 16, 0.12), C.bone) },
  { id: 'bullet_wine', emoji: '🔸', shade: false, art: () => f(sparkle(50, 50, 16, 0.12), C.wine) },
  {
    id: 'bullet_peach_glow',
    emoji: '🔸',
    shade: false,
    glow: true,
    anim: (t) =>
      tr(50, 50, 1 + 0.12 * wave(t), 0, f(sparkle(50, 50, 14, 0.12), C.peach)) +
      sparks(50, 50, 20 + 2 * wave(t), 24 + 2 * wave(t), 8, C.peach, 2, 22 + 45 * t),
  },
  { id: 'bullet_gold', emoji: '⭐️', shade: false, art: () => filledStar(star(50, 52, 15, 6.5), C.gold, 3.5) },
  { id: 'bullet_lavender', emoji: '⭐️', shade: false, art: () => filledStar(star(50, 52, 15, 6.5), C.lav, 3.5) },
  { id: 'bullet_heart', emoji: '♥️', shade: false, art: () => heartIcon(50, 52, 0.36, C.wine) },
  {
    id: 'bullet_twin',
    emoji: '✨',
    shade: false,
    art: () => f(sparkle(45, 47, 14, 0.12), C.teal) + f(sparkle(62, 63, 7, 0.12), C.bone),
  },

  // ── Glow, smoke & gothic ───────────────────────────────
  {
    id: 'spark',
    emoji: '💥',
    glow: true,
    shade: false,
    anim: (t) => {
      // Two rings of dashes that keep flying outward and fading
      const ring = (ph, rot) => {
        const p = (t + ph) % 1;
        const r1 = 12 + 26 * p;
        const len = 8 + 10 * Math.sin(Math.PI * p);
        const op = Math.sin(Math.PI * p).toFixed(2);
        return sparks(50, 50, r1, r1 + len, 9, C.peach, 4, rot, `opacity="${op}"`);
      };
      return ring(0, 8) + ring(0.5, 28) + dot(50, 50, 5 + 1.5 * wave(2 * t), C.peachL);
    },
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
      rect(18, 10, 64, 78, 2, C.bone) + rect(24, 16, 52, 50, 0, C.photo) +
      line('M24 16 L76 16 L76 66 L24 66 Z', 2) + `</g>`,
  },
  {
    id: 'id_badge',
    emoji: '🪪',
    art: () =>
      s('M30 4 L46 26 M70 4 L54 26', C.wineD, 5) +
      rect(44, 22, 12, 8, 2, C.greyD) + rect(24, 28, 52, 66, 5, C.bone) + rect(36, 38, 28, 28, 0, C.photo) +
      rect(40, 36, 20, 4, 2, C.grey) +
      line('M34 76 L66 76 M34 84 L56 84'),
  },
  {
    id: 'mask',
    emoji: '🎭',
    art: () =>
      f('M8 40 C20 30 36 34 50 42 C64 34 80 30 92 40 C94 54 86 68 72 68 C62 68 56 60 50 56 C44 60 38 68 28 68 C14 68 6 54 8 40 Z', C.greyD) +
      `<ellipse cx="30" cy="50" rx="10" ry="8" fill="${C.bone}"/><ellipse cx="70" cy="50" rx="10" ry="8" fill="${C.bone}"/>` +
      dot(31, 51, 3.2, C.ink) + dot(69, 51, 3.2, C.ink),
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
      rect(26, 38, 48, 9, 4.5, C.gold) +
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
  { id: 'fire', emoji: '🔥', glow: true, anim: flame },

  // ── Merch ──────────────────────────────────────────────
  {
    id: 'acrylic_keychain',
    emoji: '🔑',
    art: () =>
      ring(50, 11, 8, C.greyL, 4) +
      s('M50 19 L50 24 M50 28 L50 32', C.greyL, 4) +
      // clear acrylic cut edge around the printed charm
      `<g transform="translate(50 64) scale(.74) translate(-50 -50)">` + f(HEART, C.bone) + `</g>` +
      `<g transform="translate(50 64) scale(.56) translate(-50 -50)">` + f(HEART, C.wine) + `</g>` +
      dot(50, 36, 3.5, C.bone) + ring(50, 36, 2, C.greyD, 1.5) +
      glint('M28 56 C29 51 32 47 36 46', 3),
  },
  {
    id: 'acrylic_stand',
    emoji: '🧍',
    art: () =>
      // base with slot
      `<ellipse cx="50" cy="86" rx="34" ry="9" fill="${C.greyL}"/>` + line('M36 84 L64 84', 2.4) +
      // cut acrylic piece with a printed sparkle and heart
      f('M34 84 C24 70 22 50 28 36 C32 22 44 12 54 14 C66 16 76 28 76 44 C76 60 70 74 66 84 Z', C.bone) +
      f('M38 78 C32 66 30 50 34 38 C38 28 46 20 54 21 C63 23 70 32 70 45 C70 58 65 70 62 78 Z', C.tealD) +
      f(sparkle(51, 46, 16), C.bone) + heartIcon(60, 66, 0.16, C.wineL) +
      glint('M31 44 C31 36 34 30 38 26', 2.6),
  },
  {
    id: 'postcard',
    emoji: '💌',
    art: () =>
      `<g transform="rotate(-6 50 50)">` +
      rect(8, 20, 84, 60, 3, C.bone) +
      // perforated stamp
      rect(64, 26, 22, 26, 1, C.wine, `stroke="${C.bone}" stroke-width="3" stroke-dasharray="2.5 2"`) +
      heartIcon(75, 39, 0.16, C.bone) +
      line('M50 28 L50 72', 1.8) +
      line('M16 34 L42 34 M16 44 L40 44 M16 54 L36 54', 2) +
      line('M56 62 L84 62 M56 70 L78 70', 2) +
      `</g>`,
  },
  {
    id: 'shaker_charm',
    emoji: '🫧',
    anim: (t) =>
      ring(50, 10, 7, C.greyL, 4) + s('M50 17 L50 22', C.greyL, 4) +
      // thick clear acrylic frame, dark window, floating bits, glossy front
      dot(50, 56, 38, C.bone) + dot(50, 56, 29, C.photo) + dot(50, 26, 3, C.bone) +
      shakerBits(t) +
      s('M30 44 C33 36 39 31 46 29', C.shine, 3, 'opacity=".75"'),
  },
  {
    id: 'pin_badge',
    emoji: '📍',
    art: () =>
      dot(50, 50, 42, C.bone) + dot(50, 50, 33, C.teal) + ring(50, 50, 33, C.ink, 2) +
      f(sparkle(50, 50, 20), C.bone) +
      glint('M22 36 C26 26 34 18 44 15', 4),
  },
  {
    id: 'enamel_pin',
    emoji: '📌',
    art: () =>
      `<g transform="translate(50 50) scale(.86) translate(-50 -50)">` + f(HEART, C.gold) + `</g>` +
      `<g transform="translate(50 50) scale(.66) translate(-50 -50)">` + f(HEART, C.wine) + `</g>` +
      f(sparkle(50, 46, 9), C.goldL) +
      glint('M30 38 C30 33 33 30 37 29', 3),
  },
  {
    id: 'shopping_bag',
    emoji: '🛍',
    art: () =>
      s('M36 40 C36 12 64 12 64 40', C.greyD, 5) +
      f('M20 36 L80 36 L86 90 L14 90 Z', C.teal) +
      dot(36, 44, 3, C.ink) + dot(64, 44, 3, C.ink) +
      f(sparkle(50, 66, 12), C.bone),
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
    id: 'sticker',
    emoji: '🎨',
    art: () =>
      f('M20 12 L80 12 C85 12 88 15 88 20 L88 62 L62 88 L20 88 C15 88 12 85 12 80 L12 20 C12 15 15 12 20 12 Z', C.moss) +
      f('M88 62 L62 88 L66 66 Z', C.bone) + line('M88 62 L66 66 L62 88') +
      f(sparkle(44, 46, 16), C.bone) + dot(66, 30, 3.5, C.bone),
  },
  {
    id: 'envelope',
    emoji: '✉️',
    art: () =>
      rect(10, 26, 80, 54, 4, C.bone) +
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

  // ── Logo: HEHEARSE.EXE across two tiles ────────────────
  {
    id: 'logo_hehearse',
    emoji: '🖤',
    shade: false,
    art: (u) =>
      logoGradient(`${u}g`, [[0, '#c8b8a8'], [0.6, '#f0e8de'], [1, C.teal]]) +
      txt('HEHE', 50, 46, 44, `url(#${u}g)`) + txt('ARSE', 50, 90, 44, `url(#${u}g)`),
  },
  {
    id: 'logo_exe',
    emoji: '💻',
    shade: false,
    art: (u) =>
      logoGradient(`${u}g`, [[0, C.teal], [0.4, '#f0e8de'], [1, '#c8b8a8']]) +
      f(sparkle(50, 30, 11), C.teal) + txt('.EXE', 46, 90, 44, `url(#${u}g)`),
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
      `<g transform="rotate(-12 50 50)">` + rect(6, 24, 88, 52, 4, C.wine) +
      rect(11, 29, 78, 42, 2, 'none', `stroke="${C.bone}" stroke-width="2"`) +
      txt('SOLD', 50, 50, 24, C.bone) + txt('OUT', 50, 68, 20, C.bone) + `</g>`,
  },
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
      f(sparkle(80, 22, 9), C.teal),
  },
  {
    id: 'loading',
    emoji: '⏳',
    shade: false,
    still: 0.55, // half-full bar for the static PNG
    anim: (t) => {
      // Blocks fill one by one, hold full for a beat, then start over
      const filled = Math.min(5, Math.floor(t * 7));
      let blocks = '';
      for (let i = 0; i < filled; i++) blocks += rect(14 + i * 15, 45, 12, 12, 1, C.teal);
      const dots = [0, 1, 2]
        .map((i) => dot(34 + i * 16, (80 - 4 * Math.max(0, wave(t * 2, -i / 6))).toFixed(1), 3, C.bone))
        .join('');
      return rect(8, 38, 84, 26, 3, C.greyD) + blocks + dots;
    },
  },
  {
    id: 'window_exe',
    emoji: '🪟',
    art: () =>
      rect(10, 16, 80, 68, 3, C.greyD) + rect(10, 16, 80, 18, 3, C.bone) +
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
    id: 'divider',
    emoji: '➖',
    shade: false,
    art: () =>
      s('M4 50 L34 50 M66 50 L96 50', C.teal, 3.5) + f(sparkle(50, 50, 11), C.teal) +
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

// Still designs render from `art`; animated ones fall back to their first frame.
for (const d of designs) if (!d.art) d.art = (u) => d.anim(d.still ?? 0, u);
