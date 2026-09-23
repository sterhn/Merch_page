// HEHEARSE custom emoji pack: chalky, hand-drawn, in the site's palette.
// Every design is drawn on a 100×100 canvas; build.mjs adds the chalk filter
// (wobbly edges + grain) and renders each one to Telegram's 100×100 format.

export const C = {
  cream: '#f1e6d6',
  teal: '#6db5b2',
  tealL: '#a8dcd6',
  tealD: '#3f8583',
  rose: '#e89aae',
  roseD: '#c7657e',
  gold: '#ecc57a',
  goldD: '#c99a4e',
  lav: '#b6a6e2',
  lavD: '#8a78c0',
  sage: '#a5cc9f',
  ink: '#2b2233',
  shine: '#fffaf2',
};

// Hand-drawn stroke / fill helpers
const s = (d, c, w = 6.5, x = '') =>
  `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${x}/>`;
const f = (d, c, x = '') => `<path d="${d}" fill="${c}" ${x}/>`;
const dot = (cx, cy, r, c, x = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" ${x}/>`;
const ring = (cx, cy, r, c, w = 6.5) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
const txt = (t, x, y, size, c, x2 = '') =>
  `<text x="${x}" y="${y}" font-family="Caveat" font-weight="700" font-size="${size}" fill="${c}" text-anchor="middle" ${x2}>${t}</text>`;

// Shapes
const HEART = 'M50 86 C26 70 10 54 12 36 C14 20 34 14 50 30 C66 14 86 20 88 36 C90 54 74 70 50 86 Z';
const heartAt = (cx, cy, k) => {
  // HEART scaled by k around its centre (50, 50) and moved to (cx, cy)
  return `<g transform="translate(${cx} ${cy}) scale(${k}) translate(-50 -50)">`;
};
const sparkle = (cx, cy, r, k = 0.16) => {
  const a = r * k;
  return `M${cx} ${cy - r} Q${cx + a} ${cy - a} ${cx + r} ${cy} Q${cx + a} ${cy + a} ${cx} ${cy + r} Q${cx - a} ${cy + a} ${cx - r} ${cy} Q${cx - a} ${cy - a} ${cx} ${cy - r} Z`;
};
const star = (cx, cy, R, r, rot = -90) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const ang = ((rot + i * 36) * Math.PI) / 180;
    const rad = i % 2 ? r : R;
    d += `${i ? 'L' : 'M'}${(cx + rad * Math.cos(ang)).toFixed(1)} ${(cy + rad * Math.sin(ang)).toFixed(1)} `;
  }
  return d + 'Z';
};
const heartIcon = (cx, cy, k, c) => `${heartAt(cx, cy, k)}${f(HEART, c)}</g>`;
const shineArc = (d, w = 4.5) => s(d, C.shine, w, 'opacity=".85"');
const blush = (cx, cy, r = 5) => dot(cx, cy, r, C.rose, 'opacity=".75"');

// Ghost body shared by the ghost family
const GHOST = 'M26 88 L26 46 C26 24 37 12 50 12 C63 12 74 24 74 46 L74 88 L66 80 L58 88 L50 80 L42 88 L34 80 Z';
const CAT =
  'M22 42 L20 14 L40 28 C46 26 54 26 60 28 L80 14 L78 42 C84 52 84 66 76 74 C68 84 32 84 24 74 C16 66 16 52 22 42 Z';
const whiskers = (c) =>
  s('M6 58 L20 60 M6 68 L20 66 M94 58 L80 60 M94 68 L80 66', c, 3.5);

export const designs = [
  // ── Hearts ─────────────────────────────────────────────
  { id: 'heart_teal', emoji: '🩵', art: () => f(HEART, C.teal) + shineArc('M24 36 C24 30 28 26 34 25') },
  { id: 'heart_cream', emoji: '🤍', art: () => f(HEART, C.cream) + shineArc('M24 36 C24 30 28 26 34 25', 4) },
  { id: 'heart_rose', emoji: '🩷', art: () => f(HEART, C.rose) + shineArc('M24 36 C24 30 28 26 34 25') },
  { id: 'heart_gold', emoji: '💛', art: () => f(HEART, C.gold) + shineArc('M24 36 C24 30 28 26 34 25') },
  { id: 'heart_lavender', emoji: '💜', art: () => f(HEART, C.lav) + shineArc('M24 36 C24 30 28 26 34 25') },
  {
    id: 'heart_broken',
    emoji: '💔',
    art: (u) =>
      `<defs><mask id="${u}m"><rect width="100" height="100" fill="#fff"/>${s('M50 24 L42 42 L56 52 L44 68 L50 90', '#000', 5)}</mask></defs>` +
      `<g mask="url(#${u}m)">${f(HEART, C.rose)}</g>`,
  },
  {
    id: 'heart_bandaged',
    emoji: '❤️‍🩹',
    art: () =>
      f(HEART, C.roseD) +
      `<g transform="rotate(-32 50 48)"><rect x="18" y="40" width="64" height="18" rx="9" fill="${C.cream}"/>` +
      `<rect x="40" y="40" width="20" height="18" fill="#e3d2bd"/>` +
      dot(46, 46, 1.6, C.goldD) + dot(54, 46, 1.6, C.goldD) + dot(46, 52, 1.6, C.goldD) + dot(54, 52, 1.6, C.goldD) +
      `</g>`,
  },
  {
    id: 'hearts_burst',
    emoji: '💕',
    art: () =>
      heartIcon(38, 56, 0.62, C.rose) + heartIcon(74, 32, 0.38, C.teal) +
      s('M70 58 L80 62 M64 70 L70 80 M84 50 L94 50', C.cream, 4.5),
  },

  // ── Sparkles & sky ─────────────────────────────────────
  { id: 'sparkle_teal', emoji: '✨', art: () => f(sparkle(50, 50, 44), C.teal) },
  { id: 'sparkle_outline', emoji: '✨', art: () => s(sparkle(50, 50, 40, 0.22), C.cream, 6) },
  {
    id: 'sparkles_duo',
    emoji: '✨',
    art: () => f(sparkle(38, 40, 30), C.gold) + f(sparkle(74, 74, 18), C.cream),
  },
  {
    id: 'star_gold',
    emoji: '⭐️',
    art: () => f(star(50, 53, 44, 20), C.gold, `stroke="${C.gold}" stroke-width="7" stroke-linejoin="round"`) +
      shineArc('M36 44 L44 42', 4),
  },
  { id: 'star_outline', emoji: '⭐️', art: () => s(star(50, 54, 42, 18, -94), C.rose, 6) },
  {
    id: 'stars_cluster',
    emoji: '🌟',
    art: () =>
      f(star(34, 36, 22, 10), C.lav, `stroke="${C.lav}" stroke-width="4" stroke-linejoin="round"`) +
      f(star(70, 44, 16, 7, -80), C.cream, `stroke="${C.cream}" stroke-width="4" stroke-linejoin="round"`) +
      f(star(46, 74, 16, 7, -100), C.teal, `stroke="${C.teal}" stroke-width="4" stroke-linejoin="round"`),
  },
  {
    id: 'moon',
    emoji: '🌙',
    art: () =>
      f('M60 10 C34 12 16 32 16 56 C16 76 34 92 56 90 C70 89 82 82 88 70 C62 76 42 60 42 38 C42 26 50 16 60 10 Z', C.gold) +
      f(sparkle(74, 32, 12), C.cream) + dot(86, 52, 3, C.cream),
  },
  {
    id: 'shooting_star',
    emoji: '🌠',
    art: () =>
      s('M10 66 L46 44 M14 82 L50 58 M28 92 L56 72', C.tealL, 5, 'opacity=".9"') +
      f(star(68, 38, 26, 12, -80), C.gold, `stroke="${C.gold}" stroke-width="5" stroke-linejoin="round"`),
  },

  // ── Spooky-cute (the “hearse” in HEHEARSE) ──────────────
  {
    id: 'ghost',
    emoji: '👻',
    art: () =>
      f(GHOST, C.cream) +
      `<ellipse cx="41" cy="46" rx="4.5" ry="6" fill="${C.ink}"/><ellipse cx="59" cy="46" rx="4.5" ry="6" fill="${C.ink}"/>` +
      blush(34, 57) + blush(66, 57) + s('M46 58 C48 61 52 61 54 58', C.ink, 3),
  },
  {
    id: 'ghost_love',
    emoji: '🥰',
    art: () =>
      f(GHOST, C.cream) +
      s('M36 46 L41 41 L46 46 M54 46 L59 41 L64 46', C.ink, 3.5) +
      blush(34, 56) + blush(66, 56) +
      heartIcon(50, 72, 0.36, C.rose) + heartIcon(84, 22, 0.22, C.rose),
  },
  {
    id: 'ghost_cry',
    emoji: '😭',
    art: () =>
      f(GHOST, C.cream) +
      s('M34 42 L46 42 M40 42 L40 50 M54 42 L66 42 M60 42 L60 50', C.ink, 3.5) +
      s('M46 58 C48 55 52 55 54 58', C.ink, 3) +
      f('M40 54 C36 62 36 66 40 67 C44 66 44 62 40 54 Z', C.teal) +
      f('M60 54 C56 62 56 66 60 67 C64 66 64 62 60 54 Z', C.teal),
  },
  {
    id: 'coffin',
    emoji: '⚰️',
    art: () =>
      f('M38 6 L62 6 L76 30 L64 94 L36 94 L24 30 Z', C.lav) +
      s('M38 6 L62 6 L76 30 L64 94 L36 94 L24 30 Z', C.lavD, 4) +
      heartIcon(50, 42, 0.34, C.cream) +
      shineArc('M32 32 L40 18', 3.5),
  },
  {
    id: 'candle',
    emoji: '🕯',
    art: () =>
      f('M32 44 L68 44 L68 88 L32 88 Z', C.cream) +
      f('M32 44 L68 44 L68 54 C66 60 62 60 62 54 C62 64 56 66 56 56 C54 60 50 60 50 54 L32 54 Z', '#fff6e8') +
      s('M50 44 L50 36', C.ink, 3) +
      f('M50 8 C58 18 62 26 58 32 C55 37 45 37 42 32 C38 26 42 18 50 8 Z', C.gold) +
      f('M50 20 C54 25 55 29 53 32 C51 34 49 34 47 32 C45 29 46 25 50 20 Z', C.rose) +
      s('M22 90 L78 90', C.goldD, 5),
  },
  {
    id: 'bat',
    emoji: '🦇',
    art: () =>
      `<g transform="translate(50 50) scale(1.25) translate(-50 -48)">` +
      f('M50 36 C44 36 40 40 40 46 C30 34 18 30 6 34 C14 40 16 46 14 54 C22 50 28 52 32 58 C36 52 42 54 44 60 C46 64 54 64 56 60 C58 54 64 52 68 58 C72 52 78 50 86 54 C84 46 86 40 94 34 C82 30 70 34 60 46 C60 40 56 36 50 36 Z', C.lav) +
      f('M42 38 L42 28 L47 35 Z M58 38 L58 28 L53 35 Z', C.lav) +
      dot(46, 46, 2.4, C.ink) + dot(54, 46, 2.4, C.ink) + s('M47 53 L48 56 M53 53 L52 56', C.cream, 2) + `</g>`,
  },
  {
    id: 'cat_happy',
    emoji: '😸',
    art: () =>
      s(CAT, C.rose, 5.5) + whiskers(C.rose) +
      s('M32 54 L38 48 L44 54 M56 54 L62 48 L68 54', C.rose, 4.5) +
      s('M43 62 C44 67 49 67 50 62 C51 67 56 67 57 62', C.rose, 4) +
      blush(31, 64, 5.5) + blush(69, 64, 5.5),
  },
  {
    id: 'cat_cry',
    emoji: '😿',
    art: () =>
      s(CAT, C.cream, 5.5) + whiskers(C.cream) +
      s('M31 48 L45 48 M38 48 L38 58 M55 48 L69 48 M62 48 L62 58', C.cream, 4.5) +
      s('M44 66 C45 62 49 62 50 66 C51 62 55 62 56 66', C.cream, 4) +
      f('M38 62 C34 72 34 78 38 79 C42 78 42 72 38 62 Z', C.teal) +
      f('M62 62 C58 72 58 78 62 79 C66 78 66 72 62 62 Z', C.teal),
  },

  // ── Merch ──────────────────────────────────────────────
  {
    id: 'shopping_bag',
    emoji: '🛍',
    art: () =>
      s('M36 40 C36 12 64 12 64 40', C.cream, 6) +
      f('M20 36 L80 36 L86 90 L14 90 Z', C.teal) +
      dot(36, 44, 3, C.tealD) + dot(64, 44, 3, C.tealD) +
      f(sparkle(50, 66, 14), C.cream),
  },
  {
    id: 'parcel',
    emoji: '📦',
    art: () =>
      f('M14 38 L50 50 L50 92 L14 78 Z', C.gold) +
      f('M50 50 L86 38 L86 78 L50 92 Z', C.goldD) +
      f('M14 38 L50 24 L86 38 L50 50 Z', '#f5d99f') +
      s('M32 31 L68 44', C.cream, 5) + s('M68 44 L68 60', C.cream, 5) +
      heartIcon(32, 62, 0.22, C.rose),
  },
  {
    id: 'price_tag',
    emoji: '🏷',
    art: (u) =>
      `<defs><mask id="${u}h"><rect width="100" height="100" fill="#fff"/>${dot(70, 28, 6.5, '#000')}</mask></defs>` +
      s('M70 28 C80 16 88 10 96 8', C.cream, 3.5) +
      `<g mask="url(#${u}h)">` +
      f('M52 12 L84 12 C86 12 88 14 88 16 L88 46 L46 88 C43 91 39 91 36 88 L12 64 C9 61 9 57 12 54 Z', C.rose) +
      `</g>` + heartIcon(48, 54, 0.26, C.cream),
  },
  {
    id: 'pin_badge',
    emoji: '📍',
    art: () =>
      dot(50, 50, 42, C.cream) + dot(50, 50, 33, C.teal) +
      f(sparkle(50, 50, 22), C.cream) +
      s('M22 36 C26 26 34 18 44 15', C.shine, 4.5, 'opacity=".9"'),
  },
  {
    id: 'keychain',
    emoji: '🔑',
    art: () =>
      ring(50, 12, 8, C.gold, 4.5) +
      s('M50 20 L50 26 M50 30 L50 34', C.gold, 4) +
      `<g transform="translate(50 64) scale(.72) translate(-50 -50)">` +
      f(HEART, C.lav, 'opacity=".92"') + s(HEART, C.cream, 6) + `</g>` +
      s('M30 56 C31 50 35 46 40 45', C.shine, 4.5),
  },
  {
    id: 'sticker',
    emoji: '🎨',
    art: () =>
      f('M20 12 L80 12 C85 12 88 15 88 20 L88 62 L62 88 L20 88 C15 88 12 85 12 80 L12 20 C12 15 15 12 20 12 Z', C.sage) +
      f('M88 62 L62 88 L66 66 Z', C.cream) +
      f(sparkle(44, 46, 20), C.cream) + dot(66, 30, 3.5, C.cream),
  },
  {
    id: 'envelope',
    emoji: '💌',
    art: () =>
      `<rect x="10" y="26" width="80" height="54" rx="5" fill="${C.cream}"/>` +
      s('M12 30 L50 58 L88 30', '#b9a58f', 4.5) +
      heartIcon(50, 58, 0.3, C.rose),
  },
  {
    id: 'paper_plane',
    emoji: '✈️',
    art: () =>
      f('M8 46 L92 12 L68 84 L48 62 Z', C.tealL) +
      f('M92 12 L48 62 L44 84 L56 70 Z', C.teal) +
      s('M92 12 L48 62', C.tealD, 3) +
      s('M30 76 C22 82 16 92 10 90', C.cream, 3.5, 'stroke-dasharray="1 8"'),
  },

  // ── Words ──────────────────────────────────────────────
  {
    id: 'word_new',
    emoji: '🆕',
    art: () =>
      txt('new', 50, 72, 70, C.gold) + s('M14 18 L20 26 M50 8 L50 18 M86 18 L80 26', C.cream, 4.5),
  },
  {
    id: 'word_sold_out',
    emoji: '🚫',
    art: () =>
      `<g transform="rotate(-14 50 50)">` +
      `<rect x="6" y="26" width="88" height="48" rx="8" fill="none" stroke="${C.rose}" stroke-width="5"/>` +
      `<rect x="12" y="32" width="76" height="36" rx="5" fill="none" stroke="${C.rose}" stroke-width="2.5"/>` +
      txt('SOLD', 50, 50, 30, C.rose) + txt('OUT', 50, 68, 24, C.rose) + `</g>`,
  },
  {
    id: 'word_hehe',
    emoji: '😆',
    art: () => txt('hehe', 48, 70, 62, C.cream) + f(sparkle(86, 22, 11), C.teal),
  },
  { id: 'word_exe', emoji: '💻', art: () => txt('.exe', 50, 70, 66, C.teal) },
  { id: 'word_ps', emoji: '📝', art: () => txt('P.S.', 50, 72, 70, C.cream) },
  {
    id: 'exclaim',
    emoji: '‼️',
    art: () =>
      f('M26 12 L42 12 L37 62 L31 62 Z', C.rose, `stroke="${C.rose}" stroke-width="4" stroke-linejoin="round"`) +
      dot(34, 80, 7, C.rose) +
      f('M58 12 L74 12 L69 62 L63 62 Z', C.gold, `stroke="${C.gold}" stroke-width="4" stroke-linejoin="round"`) +
      dot(66, 80, 7, C.gold),
  },
  {
    id: 'question',
    emoji: '❓',
    art: () =>
      s('M14 32 C14 18 42 16 42 32 C42 42 30 44 30 56', C.gold, 7) + dot(30, 76, 5.5, C.gold) +
      s('M56 32 C56 18 84 16 84 32 C84 42 72 44 72 56', C.teal, 7) + dot(72, 76, 5.5, C.teal),
  },
  { id: 'word_merch', emoji: '🛒', art: () => txt('мерч', 50, 62, 58, C.rose) + s('M12 78 C36 70 64 70 88 78', C.teal, 5) },

  // ── Interface bits ─────────────────────────────────────
  {
    id: 'cursor',
    emoji: '🖱',
    art: () =>
      f('M26 10 L26 78 L42 64 L54 90 L66 85 L54 60 L76 60 Z', C.cream,
        `stroke="${C.tealD}" stroke-width="4" stroke-linejoin="round"`) +
      f(sparkle(80, 22, 11), C.teal),
  },
  {
    id: 'loading',
    emoji: '⏳',
    art: () =>
      `<rect x="8" y="38" width="84" height="26" rx="13" fill="none" stroke="${C.cream}" stroke-width="5"/>` +
      `<rect x="15" y="45" width="50" height="12" rx="6" fill="${C.teal}"/>` +
      dot(34, 80, 3, C.cream) + dot(50, 80, 3, C.cream) + dot(66, 80, 3, C.cream, 'opacity=".5"'),
  },
  {
    id: 'window_exe',
    emoji: '🪟',
    art: () =>
      `<rect x="10" y="16" width="80" height="68" rx="6" fill="#3a2d45" stroke="${C.cream}" stroke-width="5"/>` +
      s('M12 34 L88 34', C.cream, 5) +
      dot(21, 25, 3, C.rose) + dot(31, 25, 3, C.gold) + dot(41, 25, 3, C.teal) +
      heartIcon(50, 60, 0.34, C.rose),
  },
  {
    id: 'arrow_loop',
    emoji: '⤵️',
    art: () =>
      s('M18 16 C60 8 82 30 64 46 C50 58 30 46 42 34 C54 24 72 44 62 84', C.teal, 6) +
      s('M48 74 L62 86 L72 72', C.teal, 6),
  },
  {
    id: 'arrow_curly',
    emoji: '➡️',
    art: () => s('M8 62 C24 30 46 80 64 50 L88 46', C.gold, 6) + s('M76 34 L90 46 L78 58', C.gold, 6),
  },
  {
    id: 'bow',
    emoji: '🎀',
    art: () =>
      s('M50 44 C38 24 12 24 14 42 C16 58 38 54 50 44 C62 54 84 58 86 42 C88 24 62 24 50 44 Z', C.rose, 6) +
      s('M47 48 L32 86 M53 48 L68 86', C.rose, 6) + dot(50, 45, 7, C.rose),
  },
  {
    id: 'check',
    emoji: '✅',
    art: () => ring(50, 50, 38, C.teal, 6) + s('M32 52 L45 64 L70 36', C.cream, 7),
  },
  {
    id: 'cross',
    emoji: '❌',
    art: () => ring(50, 50, 38, C.rose, 6) + s('M36 36 L64 64 M64 36 L36 64', C.cream, 7),
  },

  // ── Extras ─────────────────────────────────────────────
  {
    id: 'paw',
    emoji: '🐾',
    art: () =>
      f('M50 48 C64 48 76 62 74 74 C72 84 62 84 50 80 C38 84 28 84 26 74 C24 62 36 48 50 48 Z', C.rose) +
      `<ellipse cx="20" cy="44" rx="8" ry="10" fill="${C.rose}" transform="rotate(-20 20 44)"/>` +
      `<ellipse cx="38" cy="26" rx="8" ry="11" fill="${C.rose}" transform="rotate(-8 38 26)"/>` +
      `<ellipse cx="62" cy="26" rx="8" ry="11" fill="${C.rose}" transform="rotate(8 62 26)"/>` +
      `<ellipse cx="80" cy="44" rx="8" ry="10" fill="${C.rose}" transform="rotate(20 80 44)"/>`,
  },
  {
    id: 'crown',
    emoji: '👑',
    art: () =>
      f('M12 34 L32 54 L50 22 L68 54 L88 34 L80 78 L20 78 Z', C.gold,
        `stroke="${C.gold}" stroke-width="5" stroke-linejoin="round"`) +
      s('M22 86 L78 86', C.goldD, 5) +
      dot(12, 30, 5, C.cream) + dot(50, 18, 5, C.rose) + dot(88, 30, 5, C.cream) +
      heartIcon(50, 62, 0.22, C.rose),
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
    id: 'eye',
    emoji: '👁',
    art: () =>
      s('M8 54 C28 26 72 26 92 54 C72 78 28 78 8 54 Z', C.cream, 5.5) +
      dot(50, 53, 14, C.teal) + dot(50, 53, 6, C.ink) + dot(55, 48, 3, C.shine) +
      s('M50 14 L50 22 M26 22 L31 29 M74 22 L69 29', C.cream, 4.5),
  },
  {
    id: 'fire',
    emoji: '🔥',
    art: () =>
      f('M50 8 C58 24 76 32 78 56 C80 76 66 92 50 92 C34 92 20 80 22 60 C23 46 32 40 36 30 C40 40 42 44 46 44 C44 32 44 20 50 8 Z', C.rose) +
      f('M50 48 C56 58 64 64 62 76 C60 84 56 88 50 88 C43 88 38 82 38 74 C38 64 46 60 50 48 Z', C.gold),
  },
  {
    id: 'divider',
    emoji: '➖',
    art: () =>
      s('M4 50 L34 50 M66 50 L96 50', C.teal, 4.5) + f(sparkle(50, 50, 13), C.teal) +
      dot(40, 50, 2.5, C.cream) + dot(60, 50, 2.5, C.cream),
  },

  // ── Numbers for lists ──────────────────────────────────
  ...['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map((n, i) => {
    const pal = [
      [C.rose, C.cream],
      [C.gold, C.rose],
      [C.teal, C.cream],
      [C.lav, C.gold],
    ][i % 4];
    return {
      id: `num_${n}`,
      emoji: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'][i],
      art: () => ring(50, 50, 40, pal[0], 6.5) + txt(n, 50, 72, n.length > 1 ? 58 : 68, pal[1]),
    };
  }),
];
