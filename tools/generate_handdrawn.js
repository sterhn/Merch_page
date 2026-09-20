#!/usr/bin/env node
/**
 * Generate hand-drawn style emoji PNGs using Rough.js.
 * Outputs 100x100 transparent PNGs to tools/emojis/.
 */

const { JSDOM } = require('jsdom');
const rough = require('roughjs');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SIZE = 100;
const EMOJI_DIR = path.join(__dirname, 'emojis');

const COLORS = {
  teal: '#4a8f8f',
  teal_accent: '#5aa0a0',
  gold: '#a3854e',
  berry: '#a64b6b',
  lavender: '#7b6ba4',
  sage: '#5a8a6e',
  cream: '#ede5da',
  yellow: '#e8b84b',
};

function createSvgDoc() {
  const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
  const doc = dom.window.document;
  const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('width', SIZE);
  svg.setAttribute('height', SIZE);
  svg.setAttribute('viewBox', `0 0 ${SIZE} ${SIZE}`);
  doc.body.appendChild(svg);
  return { dom, doc, svg };
}

function svgToString(svg) {
  return svg.outerHTML;
}

function saveSvgAsPng(svgString, outputPath) {
  const tmpSvg = outputPath.replace('.png', '.svg');
  fs.writeFileSync(tmpSvg, svgString);
  try {
    execSync(`python3 -c "
import cairosvg
cairosvg.svg2png(url='${tmpSvg}', write_to='${outputPath}', output_width=${SIZE}, output_height=${SIZE})
"`, { stdio: 'pipe' });
  } finally {
    if (fs.existsSync(tmpSvg)) fs.unlinkSync(tmpSvg);
  }
}

const ROUGH_OPTS = {
  roughness: 1.8,
  bowing: 1.5,
  strokeWidth: 2.5,
  strokeLineCap: 'round',
  strokeLineJoin: 'round',
  curveFitting: 0.95,
  curveStepCount: 9,
};

function drawIcon(drawFn) {
  const { dom, doc, svg } = createSvgDoc();
  const rc = rough.svg(svg);
  drawFn(rc, svg, doc);
  return svgToString(svg);
}

// ---- Icon drawing functions ----

function drawHeart(rc, svg, doc, color, size = 40) {
  const cx = 50, cy = 52;
  const s = size / 40;
  const d = `M ${cx} ${cy + 16*s}
    C ${cx - 4*s} ${cy + 12*s}, ${cx - 20*s} ${cy + 4*s}, ${cx - 20*s} ${cy - 6*s}
    C ${cx - 20*s} ${cy - 16*s}, ${cx - 10*s} ${cy - 20*s}, ${cx} ${cy - 10*s}
    C ${cx + 10*s} ${cy - 20*s}, ${cx + 20*s} ${cy - 16*s}, ${cx + 20*s} ${cy - 6*s}
    C ${cx + 20*s} ${cy + 4*s}, ${cx + 4*s} ${cy + 12*s}, ${cx} ${cy + 16*s} Z`;
  const node = rc.path(d, {
    ...ROUGH_OPTS,
    fill: color,
    fillStyle: 'solid',
    stroke: color,
    strokeWidth: 2,
    roughness: 2,
  });
  svg.appendChild(node);
}

function drawBrokenHeart(rc, svg, doc, color) {
  // Left half
  const dl = `M 50 68 C 46 64, 30 56, 30 44 C 30 34, 40 30, 50 40 L 52 36 L 48 28 L 52 22`;
  const dr = `M 50 68 C 54 64, 70 56, 70 44 C 70 34, 60 30, 50 40 L 48 36 L 52 28 L 48 22`;
  // Draw with a gap in the middle
  const left = rc.path(`M 50 68 C 46 64, 26 54, 26 42 C 26 30, 38 26, 47 38 L 50 32 L 46 24`, {
    ...ROUGH_OPTS, stroke: color, fill: 'none', strokeWidth: 2.5, roughness: 2,
  });
  const right = rc.path(`M 50 68 C 54 64, 74 54, 74 42 C 74 30, 62 26, 53 38 L 50 32 L 54 24`, {
    ...ROUGH_OPTS, stroke: color, fill: 'none', strokeWidth: 2.5, roughness: 2,
  });
  svg.appendChild(left);
  svg.appendChild(right);
}

function drawHeartOutline(rc, svg, doc, color) {
  const d = `M 50 70 C 46 66, 24 54, 24 40 C 24 28, 36 24, 50 38 C 64 24, 76 28, 76 40 C 76 54, 54 66, 50 70 Z`;
  const node = rc.path(d, {
    ...ROUGH_OPTS, stroke: color, fill: 'none', strokeWidth: 3, roughness: 2.2,
  });
  svg.appendChild(node);
}

function drawHeartSparkle(rc, svg, doc, color) {
  drawHeart(rc, svg, doc, color, 32);
  // Sparkle rays
  const rays = [
    [50, 20, 50, 12], [30, 30, 22, 24], [70, 30, 78, 24],
    [26, 48, 18, 48], [74, 48, 82, 48],
  ];
  for (const [x1, y1, x2, y2] of rays) {
    svg.appendChild(rc.line(x1, y1, x2, y2, {
      ...ROUGH_OPTS, stroke: color, strokeWidth: 2, roughness: 1.5,
    }));
  }
}

function drawStar4(rc, svg, doc, color, size = 36) {
  const cx = 50, cy = 50;
  const outer = size / 2;
  const inner = outer * 0.28;
  const d = `M ${cx} ${cy - outer} L ${cx + inner} ${cy - inner} L ${cx + outer} ${cy} L ${cx + inner} ${cy + inner} L ${cx} ${cy + outer} L ${cx - inner} ${cy + inner} L ${cx - outer} ${cy} L ${cx - inner} ${cy - inner} Z`;
  const node = rc.path(d, {
    ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 1.5, roughness: 1.8,
  });
  svg.appendChild(node);
}

function drawMoon(rc, svg, doc, color) {
  const node = rc.path(
    `M 42 20 C 28 28, 28 70, 50 78 C 30 74, 18 58, 18 46 C 18 30, 30 18, 48 18 C 46 18, 43 19, 42 20 Z
     M 62 22 C 76 32, 80 58, 60 76 C 78 68, 86 50, 78 34 C 74 26, 68 22, 62 22 Z`,
    { ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 1.5, roughness: 2 }
  );
  svg.appendChild(node);
}

function drawMoonCrescent(rc, svg, doc, color) {
  // Simple crescent moon
  const node = rc.path(
    `M 56 16 C 36 20, 24 36, 24 52 C 24 70, 38 82, 56 82 C 42 78, 34 66, 34 52 C 34 36, 42 22, 56 16 Z`,
    { ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 2, roughness: 2 }
  );
  svg.appendChild(node);
}

function drawLightning(rc, svg, doc, color) {
  const node = rc.path(
    `M 56 10 L 38 48 L 52 48 L 44 90 L 68 44 L 54 44 L 66 10 Z`,
    { ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 2, roughness: 2.2 }
  );
  svg.appendChild(node);
}

function drawCheckmark(rc, svg, doc, color) {
  svg.appendChild(rc.line(24, 52, 42, 72, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 4, roughness: 1.8,
  }));
  svg.appendChild(rc.line(42, 72, 78, 28, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 4, roughness: 1.8,
  }));
}

function drawCheckCircle(rc, svg, doc, color) {
  svg.appendChild(rc.circle(50, 50, 64, {
    ...ROUGH_OPTS, stroke: color, fill: 'none', strokeWidth: 2.5, roughness: 2,
  }));
  svg.appendChild(rc.line(30, 50, 44, 64, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 3, roughness: 1.5,
  }));
  svg.appendChild(rc.line(44, 64, 70, 36, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 3, roughness: 1.5,
  }));
}

function drawXCircle(rc, svg, doc, color) {
  svg.appendChild(rc.circle(50, 50, 64, {
    ...ROUGH_OPTS, stroke: color, fill: 'none', strokeWidth: 2.5, roughness: 2,
  }));
  svg.appendChild(rc.line(34, 34, 66, 66, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 3, roughness: 1.5,
  }));
  svg.appendChild(rc.line(66, 34, 34, 66, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 3, roughness: 1.5,
  }));
}

function drawExclamation(rc, svg, doc, color) {
  svg.appendChild(rc.line(50, 18, 50, 62, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 4, roughness: 1.5,
  }));
  svg.appendChild(rc.circle(50, 76, 6, {
    ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 1.5, roughness: 1.5,
  }));
}

function drawQuestion(rc, svg, doc, color) {
  svg.appendChild(rc.path(
    `M 36 34 C 36 22, 50 16, 58 22 C 66 28, 64 38, 54 42 C 50 44, 50 46, 50 52`,
    { ...ROUGH_OPTS, stroke: color, fill: 'none', strokeWidth: 3.5, roughness: 1.8 }
  ));
  svg.appendChild(rc.circle(50, 72, 6, {
    ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 1.5, roughness: 1.5,
  }));
}

function drawEnvelope(rc, svg, doc, color) {
  svg.appendChild(rc.rectangle(16, 28, 68, 48, {
    ...ROUGH_OPTS, stroke: color, fill: 'none', strokeWidth: 2.5, roughness: 2,
  }));
  svg.appendChild(rc.line(16, 28, 50, 56, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 2.5, roughness: 1.8,
  }));
  svg.appendChild(rc.line(84, 28, 50, 56, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 2.5, roughness: 1.8,
  }));
}

function drawSparkle(rc, svg, doc, color) {
  drawStar4(rc, svg, doc, color, 42);
}

function drawFlower(rc, svg, doc, color) {
  const petals = 5;
  const cx = 50, cy = 46;
  const petalR = 14;
  const dist = 16;
  for (let i = 0; i < petals; i++) {
    const angle = (i * 2 * Math.PI / petals) - Math.PI / 2;
    const px = cx + Math.cos(angle) * dist;
    const py = cy + Math.sin(angle) * dist;
    svg.appendChild(rc.circle(px, py, petalR * 2, {
      ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 1.5, roughness: 2,
    }));
  }
  svg.appendChild(rc.circle(cx, cy, 10, {
    ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 1, roughness: 1.5,
  }));
  // Stem
  svg.appendChild(rc.line(50, 62, 50, 88, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 2.5, roughness: 1.5,
  }));
  svg.appendChild(rc.path(`M 50 74 C 56 68, 64 66, 68 70`, {
    ...ROUGH_OPTS, stroke: color, fill: 'none', strokeWidth: 2, roughness: 1.5,
  }));
}

function drawSpeechBubble(rc, svg, doc, color) {
  svg.appendChild(rc.path(
    `M 20 24 L 80 24 C 82 24, 84 26, 84 28 L 84 58 C 84 60, 82 62, 80 62 L 40 62 L 28 76 L 32 62 L 20 62 C 18 62, 16 60, 16 58 L 16 28 C 16 26, 18 24, 20 24 Z`,
    { ...ROUGH_OPTS, stroke: color, fill: 'none', strokeWidth: 2.5, roughness: 2 }
  ));
  // Small heart inside
  drawHeart(rc, svg, doc, color, 16);
}

function drawSun(rc, svg, doc, color) {
  svg.appendChild(rc.circle(50, 50, 24, {
    ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 2, roughness: 2,
  }));
  const rays = 8;
  for (let i = 0; i < rays; i++) {
    const angle = (i * 2 * Math.PI / rays);
    const x1 = 50 + Math.cos(angle) * 18;
    const y1 = 50 + Math.sin(angle) * 18;
    const x2 = 50 + Math.cos(angle) * 36;
    const y2 = 50 + Math.sin(angle) * 36;
    svg.appendChild(rc.line(x1, y1, x2, y2, {
      ...ROUGH_OPTS, stroke: color, strokeWidth: 2.5, roughness: 1.5,
    }));
  }
}

function drawEye(rc, svg, doc, color) {
  svg.appendChild(rc.path(
    `M 10 50 C 20 30, 40 20, 50 20 C 60 20, 80 30, 90 50 C 80 70, 60 80, 50 80 C 40 80, 20 70, 10 50 Z`,
    { ...ROUGH_OPTS, stroke: color, fill: 'none', strokeWidth: 2.5, roughness: 2 }
  ));
  svg.appendChild(rc.circle(50, 50, 20, {
    ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 1.5, roughness: 1.8,
  }));
  // Lashes
  for (const [x1, y1, x2, y2] of [[26, 32, 20, 20], [40, 24, 36, 12], [60, 24, 64, 12], [74, 32, 80, 20]]) {
    svg.appendChild(rc.line(x1, y1, x2, y2, {
      ...ROUGH_OPTS, stroke: color, strokeWidth: 2, roughness: 1.5,
    }));
  }
}

function drawCrown(rc, svg, doc, color) {
  svg.appendChild(rc.path(
    `M 16 72 L 16 36 L 34 50 L 50 24 L 66 50 L 84 36 L 84 72 Z`,
    { ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 2.5, roughness: 2.2 }
  ));
}

function drawSkull(rc, svg, doc, color) {
  svg.appendChild(rc.path(
    `M 50 14 C 28 14, 18 30, 18 46 C 18 58, 24 66, 30 70 L 30 78 L 40 78 L 40 74 L 48 74 L 48 78 L 60 78 L 60 74 L 70 74 L 70 78 L 70 78 L 70 70 C 76 66, 82 58, 82 46 C 82 30, 72 14, 50 14 Z`,
    { ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 2, roughness: 2 }
  ));
  // Eyes
  svg.appendChild(rc.circle(38, 44, 12, {
    ...ROUGH_OPTS, fill: '#110e16', fillStyle: 'solid', stroke: '#110e16', strokeWidth: 1, roughness: 1.5,
  }));
  svg.appendChild(rc.circle(62, 44, 12, {
    ...ROUGH_OPTS, fill: '#110e16', fillStyle: 'solid', stroke: '#110e16', strokeWidth: 1, roughness: 1.5,
  }));
  // Nose
  svg.appendChild(rc.path(`M 46 56 L 50 62 L 54 56`, {
    ...ROUGH_OPTS, stroke: '#110e16', fill: 'none', strokeWidth: 1.5, roughness: 1.5,
  }));
}

function drawGhost(rc, svg, doc, color) {
  svg.appendChild(rc.path(
    `M 28 50 C 28 30, 38 16, 50 16 C 62 16, 72 30, 72 50 L 72 76 L 64 68 L 56 76 L 50 68 L 44 76 L 36 68 L 28 76 Z`,
    { ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 2, roughness: 2 }
  ));
  svg.appendChild(rc.circle(40, 42, 6, {
    ...ROUGH_OPTS, fill: '#110e16', fillStyle: 'solid', stroke: '#110e16', strokeWidth: 1, roughness: 1,
  }));
  svg.appendChild(rc.circle(58, 42, 6, {
    ...ROUGH_OPTS, fill: '#110e16', fillStyle: 'solid', stroke: '#110e16', strokeWidth: 1, roughness: 1,
  }));
}

function drawCat(rc, svg, doc, color) {
  // Cat face
  svg.appendChild(rc.path(
    `M 22 44 C 22 30, 34 20, 50 20 C 66 20, 78 30, 78 44 L 78 64 C 78 74, 66 82, 50 82 C 34 82, 22 74, 22 64 Z`,
    { ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 2, roughness: 2 }
  ));
  // Ears
  svg.appendChild(rc.path(`M 22 44 L 18 16 L 38 32`, {
    ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 2, roughness: 2,
  }));
  svg.appendChild(rc.path(`M 78 44 L 82 16 L 62 32`, {
    ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 2, roughness: 2,
  }));
  // Eyes
  svg.appendChild(rc.circle(38, 48, 5, {
    ...ROUGH_OPTS, fill: '#110e16', fillStyle: 'solid', stroke: '#110e16', strokeWidth: 1, roughness: 1,
  }));
  svg.appendChild(rc.circle(62, 48, 5, {
    ...ROUGH_OPTS, fill: '#110e16', fillStyle: 'solid', stroke: '#110e16', strokeWidth: 1, roughness: 1,
  }));
  // Nose + mouth
  svg.appendChild(rc.path(`M 47 58 L 50 62 L 53 58`, {
    ...ROUGH_OPTS, stroke: '#110e16', fill: 'none', strokeWidth: 1.5, roughness: 1,
  }));
  svg.appendChild(rc.path(`M 50 62 L 50 66`, {
    ...ROUGH_OPTS, stroke: '#110e16', fill: 'none', strokeWidth: 1.5, roughness: 1,
  }));
}

function drawKey(rc, svg, doc, color) {
  // Key head (circle)
  svg.appendChild(rc.circle(36, 34, 24, {
    ...ROUGH_OPTS, stroke: color, fill: 'none', strokeWidth: 2.5, roughness: 2,
  }));
  svg.appendChild(rc.circle(36, 34, 8, {
    ...ROUGH_OPTS, stroke: color, fill: 'none', strokeWidth: 2, roughness: 1.5,
  }));
  // Key shaft
  svg.appendChild(rc.line(48, 42, 80, 74, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 3, roughness: 1.5,
  }));
  // Key teeth
  svg.appendChild(rc.line(68, 62, 76, 62, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 2.5, roughness: 1.5,
  }));
  svg.appendChild(rc.line(74, 68, 82, 68, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 2.5, roughness: 1.5,
  }));
}

function drawFeather(rc, svg, doc, color) {
  svg.appendChild(rc.path(
    `M 70 14 C 60 14, 40 26, 28 42 C 18 56, 16 70, 20 80 L 14 88
     M 70 14 C 74 24, 68 42, 56 56 C 46 66, 32 74, 20 80
     M 28 42 C 40 40, 56 34, 70 14
     M 28 42 C 28 56, 24 68, 20 80`,
    { ...ROUGH_OPTS, stroke: color, fill: 'none', strokeWidth: 2, roughness: 2 }
  ));
  // Center line
  svg.appendChild(rc.path(`M 60 22 C 48 38, 34 56, 20 80`, {
    ...ROUGH_OPTS, stroke: color, fill: 'none', strokeWidth: 1.5, roughness: 1.5,
  }));
}

function drawLeaf(rc, svg, doc, color) {
  svg.appendChild(rc.path(
    `M 50 14 C 74 22, 84 44, 78 62 C 72 80, 52 88, 34 80 C 18 72, 14 50, 22 34 C 30 18, 48 12, 50 14 Z`,
    { ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 2, roughness: 2 }
  ));
  // Vein
  svg.appendChild(rc.path(`M 50 14 C 48 40, 42 60, 34 80`, {
    ...ROUGH_OPTS, stroke: '#110e16', fill: 'none', strokeWidth: 1.5, roughness: 1.5, strokeLineDash: [0],
  }));
  // Side veins
  svg.appendChild(rc.path(`M 46 32 C 36 36, 30 42, 28 48`, {
    ...ROUGH_OPTS, stroke: '#110e16', fill: 'none', strokeWidth: 1, roughness: 1.5,
  }));
  svg.appendChild(rc.path(`M 48 48 C 56 44, 64 44, 70 48`, {
    ...ROUGH_OPTS, stroke: '#110e16', fill: 'none', strokeWidth: 1, roughness: 1.5,
  }));
}

function drawHourglass(rc, svg, doc, color) {
  svg.appendChild(rc.line(22, 14, 78, 14, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 3, roughness: 1.5,
  }));
  svg.appendChild(rc.line(22, 86, 78, 86, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 3, roughness: 1.5,
  }));
  svg.appendChild(rc.path(
    `M 28 14 L 28 30 C 28 44, 50 50, 50 50 C 50 50, 28 56, 28 70 L 28 86
     M 72 14 L 72 30 C 72 44, 50 50, 50 50 C 50 50, 72 56, 72 70 L 72 86`,
    { ...ROUGH_OPTS, stroke: color, fill: 'none', strokeWidth: 2.5, roughness: 2 }
  ));
}

function drawSwords(rc, svg, doc, color) {
  // Sword 1 (top-left to bottom-right)
  svg.appendChild(rc.line(18, 18, 70, 70, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 3, roughness: 1.5,
  }));
  svg.appendChild(rc.line(60, 60, 82, 82, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 2.5, roughness: 1.5,
  }));
  svg.appendChild(rc.line(56, 68, 68, 56, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 2.5, roughness: 1.5,
  }));
  // Sword 2 (top-right to bottom-left)
  svg.appendChild(rc.line(82, 18, 30, 70, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 3, roughness: 1.5,
  }));
  svg.appendChild(rc.line(40, 60, 18, 82, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 2.5, roughness: 1.5,
  }));
  svg.appendChild(rc.line(32, 56, 44, 68, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 2.5, roughness: 1.5,
  }));
}

function drawSpider(rc, svg, doc, color) {
  // Body
  svg.appendChild(rc.ellipse(50, 46, 18, 14, {
    ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 1.5, roughness: 2,
  }));
  svg.appendChild(rc.ellipse(50, 58, 14, 18, {
    ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 1.5, roughness: 2,
  }));
  // Legs
  const legs = [
    [42, 44, 14, 24], [40, 48, 10, 42], [40, 54, 12, 64], [42, 60, 18, 78],
    [58, 44, 86, 24], [60, 48, 90, 42], [60, 54, 88, 64], [58, 60, 82, 78],
  ];
  for (const [x1, y1, x2, y2] of legs) {
    svg.appendChild(rc.line(x1, y1, x2, y2, {
      ...ROUGH_OPTS, stroke: color, strokeWidth: 2, roughness: 1.8,
    }));
  }
  // Eyes
  svg.appendChild(rc.circle(46, 42, 4, {
    ...ROUGH_OPTS, fill: '#110e16', fillStyle: 'solid', stroke: '#110e16', strokeWidth: 1, roughness: 1,
  }));
  svg.appendChild(rc.circle(54, 42, 4, {
    ...ROUGH_OPTS, fill: '#110e16', fillStyle: 'solid', stroke: '#110e16', strokeWidth: 1, roughness: 1,
  }));
}

function drawRibbon(rc, svg, doc, color) {
  svg.appendChild(rc.path(
    `M 50 16 C 44 16, 38 22, 38 30 C 38 38, 44 42, 50 46 C 56 42, 62 38, 62 30 C 62 22, 56 16, 50 16 Z`,
    { ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 2, roughness: 2 }
  ));
  svg.appendChild(rc.path(
    `M 50 46 L 34 84 L 42 72 L 50 80 L 58 72 L 66 84 L 50 46 Z`,
    { ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 2, roughness: 2 }
  ));
}

function drawHeadphones(rc, svg, doc, color) {
  svg.appendChild(rc.path(
    `M 20 54 C 20 32, 32 18, 50 18 C 68 18, 80 32, 80 54`,
    { ...ROUGH_OPTS, stroke: color, fill: 'none', strokeWidth: 3, roughness: 2 }
  ));
  svg.appendChild(rc.rectangle(14, 52, 14, 24, {
    ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 2, roughness: 2,
  }));
  svg.appendChild(rc.rectangle(72, 52, 14, 24, {
    ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 2, roughness: 2,
  }));
}

function drawBookmark(rc, svg, doc, color) {
  svg.appendChild(rc.path(
    `M 28 12 L 72 12 L 72 88 L 50 70 L 28 88 Z`,
    { ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 2.5, roughness: 2.2 }
  ));
}

function drawArrowRight(rc, svg, doc, color) {
  svg.appendChild(rc.line(16, 50, 74, 50, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 3.5, roughness: 1.5,
  }));
  svg.appendChild(rc.line(58, 30, 82, 50, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 3.5, roughness: 1.5,
  }));
  svg.appendChild(rc.line(58, 70, 82, 50, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 3.5, roughness: 1.5,
  }));
}

function drawOkText(rc, svg, doc, color) {
  // Hand-drawn "OK" text
  svg.appendChild(rc.circle(32, 50, 28, {
    ...ROUGH_OPTS, stroke: color, fill: 'none', strokeWidth: 4, roughness: 2.5,
  }));
  // K
  svg.appendChild(rc.line(62, 30, 62, 70, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 4, roughness: 2,
  }));
  svg.appendChild(rc.line(62, 50, 82, 30, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 4, roughness: 2,
  }));
  svg.appendChild(rc.line(62, 50, 82, 70, {
    ...ROUGH_OPTS, stroke: color, strokeWidth: 4, roughness: 2,
  }));
}

function drawSadFace(rc, svg, doc, color) {
  svg.appendChild(rc.circle(50, 50, 64, {
    ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 2, roughness: 2,
  }));
  // X eyes
  svg.appendChild(rc.line(32, 36, 42, 46, {
    ...ROUGH_OPTS, stroke: '#110e16', strokeWidth: 2.5, roughness: 1.5,
  }));
  svg.appendChild(rc.line(42, 36, 32, 46, {
    ...ROUGH_OPTS, stroke: '#110e16', strokeWidth: 2.5, roughness: 1.5,
  }));
  svg.appendChild(rc.line(58, 36, 68, 46, {
    ...ROUGH_OPTS, stroke: '#110e16', strokeWidth: 2.5, roughness: 1.5,
  }));
  svg.appendChild(rc.line(68, 36, 58, 46, {
    ...ROUGH_OPTS, stroke: '#110e16', strokeWidth: 2.5, roughness: 1.5,
  }));
  // Sad mouth
  svg.appendChild(rc.path(`M 36 66 C 40 58, 60 58, 64 66`, {
    ...ROUGH_OPTS, stroke: '#110e16', fill: 'none', strokeWidth: 2, roughness: 1.5,
  }));
}

function drawDot(rc, svg, doc, color) {
  svg.appendChild(rc.circle(50, 50, 24, {
    ...ROUGH_OPTS, fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 1.5, roughness: 2,
  }));
}

// ---- Build manifest and generate all icons ----

const icons = [];

// Hearts (4 colors)
for (const [colorName, emoji] of [['teal', '💚'], ['berry', '❤️'], ['lavender', '💜'], ['gold', '💛']]) {
  icons.push({
    name: `heart_${colorName}`, category: 'icon_heart', emoji,
    draw: (rc, svg, doc) => drawHeart(rc, svg, doc, COLORS[colorName]),
  });
}

// Heart outline
icons.push({
  name: 'heart_outline_berry', category: 'icon_heart', emoji: '❤️',
  draw: (rc, svg, doc) => drawHeartOutline(rc, svg, doc, COLORS.berry),
});

// Heart sparkle
icons.push({
  name: 'heart_sparkle_berry', category: 'icon_heart', emoji: '❤️',
  draw: (rc, svg, doc) => drawHeartSparkle(rc, svg, doc, COLORS.berry),
});

// Broken heart
icons.push({
  name: 'broken_heart_lavender', category: 'icon_heart', emoji: '💔',
  draw: (rc, svg, doc) => drawBrokenHeart(rc, svg, doc, COLORS.lavender),
});

// Stars (5 fandom colors)
for (const colorName of ['teal', 'gold', 'berry', 'lavender', 'sage']) {
  icons.push({
    name: `star_${colorName}`, category: 'icon_star', emoji: '⭐',
    draw: (rc, svg, doc) => drawStar4(rc, svg, doc, COLORS[colorName]),
  });
}

// Moon crescent (2 colors)
for (const [colorName, emoji] of [['teal', '🌙'], ['lavender', '🌙']]) {
  icons.push({
    name: `moon_${colorName}`, category: 'icon_decorative', emoji,
    draw: (rc, svg, doc) => drawMoonCrescent(rc, svg, doc, COLORS[colorName]),
  });
}

// Lightning (3 colors)
for (const [colorName, emoji] of [['teal', '⚡'], ['berry', '⚡'], ['gold', '⚡']]) {
  icons.push({
    name: `lightning_${colorName}`, category: 'icon_decorative', emoji,
    draw: (rc, svg, doc) => drawLightning(rc, svg, doc, COLORS[colorName]),
  });
}

// Checkmarks (4 colors)
for (const [colorName, emoji] of [['teal', '✅'], ['gold', '✅'], ['berry', '✅'], ['lavender', '✅']]) {
  icons.push({
    name: `check_${colorName}`, category: 'icon_symbol', emoji,
    draw: (rc, svg, doc) => drawCheckmark(rc, svg, doc, COLORS[colorName]),
  });
}

// Check circles (2 colors)
for (const [colorName, emoji] of [['teal', '✅'], ['gold', '✅']]) {
  icons.push({
    name: `check_circle_${colorName}`, category: 'icon_symbol', emoji,
    draw: (rc, svg, doc) => drawCheckCircle(rc, svg, doc, COLORS[colorName]),
  });
}

// X circles (2 colors)
for (const [colorName, emoji] of [['berry', '❌'], ['lavender', '❌']]) {
  icons.push({
    name: `x_circle_${colorName}`, category: 'icon_symbol', emoji,
    draw: (rc, svg, doc) => drawXCircle(rc, svg, doc, COLORS[colorName]),
  });
}

// Exclamation (3 colors)
for (const [colorName, emoji] of [['teal', '❗'], ['berry', '❗'], ['gold', '❗']]) {
  icons.push({
    name: `exclaim_${colorName}`, category: 'icon_symbol', emoji,
    draw: (rc, svg, doc) => drawExclamation(rc, svg, doc, COLORS[colorName]),
  });
}

// Question (3 colors)
for (const [colorName, emoji] of [['teal', '❓'], ['berry', '❓'], ['lavender', '❓']]) {
  icons.push({
    name: `question_${colorName}`, category: 'icon_symbol', emoji,
    draw: (rc, svg, doc) => drawQuestion(rc, svg, doc, COLORS[colorName]),
  });
}

// Envelope (3 colors)
for (const [colorName, emoji] of [['teal', '📧'], ['berry', '📧'], ['gold', '📧']]) {
  icons.push({
    name: `envelope_${colorName}`, category: 'icon_decorative', emoji,
    draw: (rc, svg, doc) => drawEnvelope(rc, svg, doc, COLORS[colorName]),
  });
}

// Sparkle diamond (3 colors)
for (const [colorName, emoji] of [['teal', '✨'], ['gold', '✨'], ['lavender', '✨']]) {
  icons.push({
    name: `sparkle_${colorName}`, category: 'icon_decorative', emoji,
    draw: (rc, svg, doc) => drawSparkle(rc, svg, doc, COLORS[colorName]),
  });
}

// Flower (3 colors)
for (const [colorName, emoji] of [['teal', '🌸'], ['berry', '🌸'], ['lavender', '🌸']]) {
  icons.push({
    name: `flower_${colorName}`, category: 'icon_decorative', emoji,
    draw: (rc, svg, doc) => drawFlower(rc, svg, doc, COLORS[colorName]),
  });
}

// Single-color icons
const singleIcons = [
  ['speech_bubble', 'berry', '💬', drawSpeechBubble],
  ['sun', 'gold', '☀️', drawSun],
  ['eye', 'lavender', '👁️', drawEye],
  ['crown', 'gold', '👑', drawCrown],
  ['skull', 'teal', '💀', drawSkull],
  ['ghost', 'teal', '👻', drawGhost],
  ['cat', 'teal', '🐈', drawCat],
  ['key', 'gold', '🗝️', drawKey],
  ['feather', 'teal', '🪶', drawFeather],
  ['leaf', 'sage', '🌿', drawLeaf],
  ['hourglass', 'gold', '⏳', drawHourglass],
  ['swords', 'teal', '⚔️', drawSwords],
  ['spider', 'lavender', '🕷️', drawSpider],
  ['ribbon', 'berry', '🎀', drawRibbon],
  ['headphones', 'berry', '🎧', drawHeadphones],
  ['bookmark_teal', 'teal', '🔖', drawBookmark],
  ['bookmark_gold', 'gold', '🔖', drawBookmark],
  ['arrow_right', 'teal', '➡️', drawArrowRight],
  ['ok_text', 'teal', '🆗', drawOkText],
  ['sad_face_berry', 'berry', '😢', drawSadFace],
  ['sad_face_lavender', 'lavender', '😢', drawSadFace],
];

for (const [name, colorName, emoji, drawFn] of singleIcons) {
  icons.push({
    name, category: 'icon_decorative', emoji,
    draw: (rc, svg, doc) => drawFn(rc, svg, doc, COLORS[colorName]),
  });
}

// Dot bullets (6 colors)
for (const [colorName, emoji] of [['teal', '🟢'], ['berry', '🔴'], ['lavender', '🟣'], ['gold', '🟡'], ['sage', '🟢'], ['cream', '⚪']]) {
  icons.push({
    name: `dot_${colorName}`, category: 'icon_dot', emoji,
    draw: (rc, svg, doc) => drawDot(rc, svg, doc, COLORS[colorName]),
  });
}

// ---- Main ----

if (!fs.existsSync(EMOJI_DIR)) {
  fs.mkdirSync(EMOJI_DIR, { recursive: true });
}

const manifest = [];
let count = 0;

for (const icon of icons) {
  const fn = `${icon.name}.png`;
  const outPath = path.join(EMOJI_DIR, fn);

  process.stdout.write(`  ${icon.name}...`);

  try {
    const svgStr = drawIcon(icon.draw);
    saveSvgAsPng(svgStr, outPath);
    process.stdout.write(' OK\n');
  } catch (err) {
    process.stdout.write(` FAIL: ${err.message}\n`);
    continue;
  }

  manifest.push({
    filename: fn,
    character: icon.name,
    color_name: icon.name.split('_').pop(),
    color_hex: COLORS[icon.name.split('_').pop()] || '#000000',
    category: icon.category,
    emoji_list: [icon.emoji],
  });
  count++;
}

console.log(`\nGenerated ${count} hand-drawn icons`);
console.log(`Remaining: numbers (10) + fandom labels (6) = 16 from generate_emojis.py`);

// Save partial manifest (will be merged with numbers + fandoms from generate_emojis.py)
const manifestPath = path.join(EMOJI_DIR, 'handdrawn_manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Manifest: ${manifestPath}`);
