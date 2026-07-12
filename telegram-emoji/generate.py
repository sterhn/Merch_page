#!/usr/bin/env python3
"""Generate a Telegram custom-emoji pack (100x100 transparent PNGs)
in the HEHEARSE merch page style: dark-mystical elegance, teal + cream +
tan + gold + rose, crisp geometric shapes, Cormorant Garamond serif glyphs."""

import os
import math
import cairosvg
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "pack")
os.makedirs(OUT, exist_ok=True)

FONT_PATH = os.path.join(HERE, "cormorant.ttf")  # Cormorant Garamond 700 — the site's --serif

# ---- palette (from index.html of the merch page, lightened slightly for dark chat bg)
TEAL   = "#5aa0a0"   # --accent
TEAL_L = "#7dbdbd"   # accent hover
TEAL_D = "#4a8f8f"
CREAM  = "#f0e8de"
TAN    = "#c8b8a8"
INK    = "#ede5da"
GOLD   = "#c2a165"   # fandom gold #a3854e, lightened for visibility
ROSE   = "#c06584"   # fandom rose #a64b6b, lightened
RED    = "#c45555"
BLUE   = "#7da7e8"
PURPLE = "#9184c0"
GREEN  = "#74a98a"

SIZE = 100


def save_svg(name, body):
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">{body}</svg>'
    cairosvg.svg2png(bytestring=svg.encode(), write_to=os.path.join(OUT, name + ".png"),
                     output_width=SIZE, output_height=SIZE)
    print("svg ", name)


# ---------- font glyphs ----------

FONT = ImageFont.truetype(FONT_PATH, 600)
FEATURES = ["lnum"]  # lining figures — uniform digit height


def _render(ch, color):
    img = Image.new("RGBA", (1400, 1400), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.text((150, 150), ch, font=FONT, fill=color, features=FEATURES)
    return img.crop(img.getbbox())


def _ref_scale(ref_ch, target_h):
    return target_h / _render(ref_ch, "#fff").height


def glyph(name, ch, color, scale, max_dim=96):
    g = _render(ch, color)
    s = scale
    if max(g.width, g.height) * s > max_dim:
        s = max_dim / max(g.width, g.height)
    w, h = max(1, round(g.width * s)), max(1, round(g.height * s))
    g = g.resize((w, h), Image.LANCZOS)
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    canvas.paste(g, ((SIZE - w) // 2, (SIZE - h) // 2), g)
    canvas.save(os.path.join(OUT, name + ".png"))
    print("chr ", name)


# ---------- geometric shapes ----------

# the site's ✦ ornament — sharp four-point star with gently concave sides
ORN = ("M50 3 Q55 45 97 50 Q55 55 50 97 Q45 55 3 50 Q45 45 50 3 Z")

# clean two-arc heart with a crisp V point
HEART = "M50 88 L18 56 A20 20 0 1 1 50 32 A20 20 0 1 1 82 56 Z"

def heart_at(x, y, s, color):
    return (f'<g transform="translate({x} {y}) scale({s}) translate(-50 -50)">'
            f'<path d="{HEART}" fill="{color}"/></g>')

def orn_at(x, y, s, color, rot=0):
    return (f'<g transform="translate({x} {y}) rotate({rot}) scale({s}) translate(-50 -50)">'
            f'<path d="{ORN}" fill="{color}"/></g>')

def star_points(cx=50, cy=52, r_out=46, r_in=17.8, rot=-90):
    pts = []
    for i in range(10):
        r = r_out if i % 2 == 0 else r_in
        a = math.radians(rot + i * 36)
        pts.append(f"{cx + r * math.cos(a):.1f},{cy + r * math.sin(a):.1f}")
    return " ".join(pts)

STROKE = 'fill="none" stroke-linecap="butt" stroke-linejoin="miter"'


def doodles():
    # -- the site's ✦ ornament, three colors
    for cname, c in (("teal", TEAL), ("cream", CREAM), ("gold", GOLD)):
        save_svg(f"ornament_{cname}", f'<path d="{ORN}" fill="{c}"/>')

    # -- sparkle clusters (compositions of the ✦)
    save_svg("sparkles_teal",
             orn_at(40, 54, 0.74, TEAL) + orn_at(78, 24, 0.34, TEAL_L)
             + f'<circle cx="78" cy="66" r="4.5" fill="{CREAM}"/>'
             + f'<circle cx="16" cy="20" r="3.5" fill="{TEAL_L}"/>')
    save_svg("sparkles_gold",
             orn_at(58, 44, 0.74, GOLD) + orn_at(20, 72, 0.32, CREAM)
             + f'<circle cx="24" cy="22" r="4.5" fill="{TAN}"/>'
             + f'<circle cx="86" cy="80" r="3.5" fill="{GOLD}"/>')
    save_svg("sparkles_mixed",
             orn_at(34, 38, 0.56, TEAL) + orn_at(72, 62, 0.42, GOLD)
             + orn_at(68, 18, 0.24, CREAM)
             + f'<circle cx="24" cy="78" r="4" fill="{ROSE}"/>')

    # -- hearts
    for cname, c in (("teal", TEAL), ("rose", ROSE), ("cream", CREAM)):
        save_svg(f"heart_{cname}", f'<path d="{HEART}" fill="{c}"/>')
    for cname, c in (("teal", TEAL), ("rose", ROSE)):
        save_svg(f"heart_outline_{cname}",
                 f'<g transform="translate(50 50) scale(0.9) translate(-50 -50)">'
                 f'<path d="{HEART}" {STROKE} stroke="{c}" stroke-width="7"/></g>')
    save_svg("hearts_cluster",
             heart_at(38, 44, 0.62, TEAL) + heart_at(74, 68, 0.36, CREAM)
             + heart_at(74, 26, 0.26, ROSE))

    # -- five-point stars, crisp
    for cname, c in (("teal", TEAL), ("gold", GOLD)):
        save_svg(f"star_{cname}", f'<polygon points="{star_points()}" fill="{c}"/>')
    save_svg("stars_cluster",
             f'<polygon points="{star_points(34, 38, 26, 10)}" fill="{TEAL}"/>'
             f'<polygon points="{star_points(74, 64, 18, 7)}" fill="{GOLD}"/>'
             f'<polygon points="{star_points(72, 20, 10, 3.9)}" fill="{CREAM}"/>')

    # -- checks / crosses / plus: straight strokes, sharp ends
    CHECK = "M16 54 L38 78 L84 20"
    for cname, c in (("teal", TEAL), ("cream", CREAM)):
        save_svg(f"check_{cname}", f'<path d="{CHECK}" {STROKE} stroke="{c}" stroke-width="10"/>')
    save_svg("check_circle",
             f'<circle cx="50" cy="50" r="45" fill="{CREAM}"/>'
             f'<path d="M29 51 L43 66 L72 32" {STROKE} stroke="{TEAL_D}" stroke-width="9"/>')
    for cname, c in (("rose", ROSE), ("teal", TEAL)):
        save_svg(f"cross_{cname}",
                 f'<path d="M22 22 L78 78 M78 22 L22 78" {STROKE} stroke="{c}" stroke-width="10"/>')
    for cname, c in (("teal", TEAL), ("cream", CREAM)):
        save_svg(f"plus_{cname}",
                 f'<path d="M50 12 L50 88 M12 50 L88 50" {STROKE} stroke="{c}" stroke-width="10"/>')

    # -- arrows: straight shaft + solid triangular head
    def arrow(c, rot):
        return (f'<g transform="rotate({rot} 50 50)">'
                f'<rect x="8" y="45.5" width="56" height="9" fill="{c}"/>'
                f'<polygon points="62,29 92,50 62,71" fill="{c}"/></g>')
    save_svg("arrow_right_teal", arrow(TEAL, 0))
    save_svg("arrow_right_cream", arrow(CREAM, 0))
    save_svg("arrow_up_teal", arrow(TEAL, -90))
    save_svg("arrow_down_cream", arrow(CREAM, 90))

    # -- moon & sun
    save_svg("moon",
             f'<path d="M58 6 A44 44 0 1 0 58 94 A54 54 0 0 1 58 6 Z" fill="{TAN}"/>'
             + orn_at(76, 28, 0.26, CREAM) + orn_at(84, 58, 0.16, CREAM))
    rays = "".join(
        f'<g transform="rotate({a} 50 50)"><rect x="47.5" y="2" width="5" height="16" fill="{GOLD}"/></g>'
        for a in range(0, 360, 45))
    save_svg("sun",
             rays + f'<circle cx="50" cy="50" r="23" fill="{CREAM}"/>'
             f'<circle cx="50" cy="50" r="23" fill="none" stroke="{GOLD}" stroke-width="3"/>')

    # -- dots: perfect circles
    for cname, c in (("teal", TEAL), ("cream", CREAM), ("rose", ROSE), ("gold", GOLD)):
        save_svg(f"dot_{cname}", f'<circle cx="50" cy="50" r="26" fill="{c}"/>')

    # -- bars & dividers: sharp rectangles (site uses 2px radius)
    for cname, c in (("teal", TEAL), ("cream", CREAM)):
        save_svg(f"bar_{cname}", f'<rect x="42" y="10" width="16" height="80" rx="2" fill="{c}"/>')
    for cname, c in (("teal", TEAL), ("cream", CREAM), ("tan", TAN)):
        save_svg(f"line_{cname}", f'<rect x="4" y="45" width="92" height="10" rx="2" fill="{c}"/>')
    # header-rule divider: line ✦ line, like the site header
    for cname, c in (("teal", TEAL), ("cream", CREAM)):
        save_svg(f"wave_{cname}",
                 f'<rect x="2" y="48.5" width="30" height="3" fill="{c}"/>'
                 f'<rect x="68" y="48.5" width="30" height="3" fill="{c}"/>'
                 + orn_at(50, 50, 0.32, c))

    # -- square brackets, sharp corners
    save_svg("bracket_left",
             f'<path d="M64 12 L34 12 L34 88 L64 88" {STROKE} stroke="{CREAM}" stroke-width="8"/>')
    save_svg("bracket_right",
             f'<path d="M36 12 L66 12 L66 88 L36 88" {STROKE} stroke="{CREAM}" stroke-width="8"/>')
    save_svg("bracket_left_teal",
             f'<path d="M64 12 L34 12 L34 88 L64 88" {STROKE} stroke="{TEAL}" stroke-width="8"/>')
    save_svg("bracket_right_teal",
             f'<path d="M36 12 L66 12 L66 88 L36 88" {STROKE} stroke="{TEAL}" stroke-width="8"/>')

    # -- faces: minimal, precise
    RCAP = 'fill="none" stroke-linecap="round"'
    save_svg("face_happy",
             f'<circle cx="30" cy="34" r="6" fill="{TEAL}"/>'
             f'<circle cx="70" cy="34" r="6" fill="{TEAL}"/>'
             f'<path d="M22 56 A28 28 0 0 0 78 56" {RCAP} stroke="{TEAL}" stroke-width="8"/>')
    save_svg("face_content",
             f'<path d="M20 38 A11 11 0 0 1 42 38" {RCAP} stroke="{CREAM}" stroke-width="7"/>'
             f'<path d="M58 38 A11 11 0 0 1 80 38" {RCAP} stroke="{CREAM}" stroke-width="7"/>'
             f'<path d="M34 60 A16 16 0 0 0 66 60" {RCAP} stroke="{CREAM}" stroke-width="7"/>')
    save_svg("face_sad",
             f'<circle cx="30" cy="38" r="6" fill="{TEAL_D}"/>'
             f'<circle cx="70" cy="38" r="6" fill="{TEAL_D}"/>'
             f'<path d="M24 74 A28 28 0 0 1 76 74" {RCAP} stroke="{TEAL_D}" stroke-width="8"/>')
    save_svg("face_love",
             heart_at(30, 34, 0.28, ROSE) + heart_at(70, 34, 0.28, ROSE)
             + f'<path d="M26 58 A26 26 0 0 0 74 58" {RCAP} stroke="{ROSE}" stroke-width="8"/>')

    # -- lightbulb (idea): clean circle bulb + straight rays
    save_svg("lightbulb",
             f'<circle cx="50" cy="44" r="22" fill="none" stroke="{CREAM}" stroke-width="6"/>'
             f'<path d="M41 64 L41 74 L59 74 L59 64" {STROKE} stroke="{CREAM}" stroke-width="6"/>'
             f'<rect x="42" y="80" width="16" height="5" fill="{CREAM}"/>'
             f'<path d="M50 4 L50 14 M20 12 L26 21 M80 12 L74 21 M8 38 L18 41 M92 38 L82 41" '
             f'{STROKE} stroke="{GOLD}" stroke-width="5"/>')

    # -- bursts: thin straight rays
    def burst(c, rot=0):
        return "".join(
            f'<g transform="rotate({rot + i * 60} 50 50)"><rect x="46.5" y="8" width="7" height="30" fill="{c}"/></g>'
            for i in range(6))
    save_svg("burst_teal", burst(TEAL, 10))
    save_svg("burst_cream", burst(CREAM, -10))

    # -- bookmark flags: straight pennant
    for cname, c in (("teal", TEAL), ("rose", ROSE)):
        save_svg(f"flag_{cname}",
                 f'<polygon points="30,10 70,10 70,86 50,64 30,86" fill="{c}"/>')

    # -- envelope with heart: sharp rectangle, straight flap
    save_svg("envelope",
             f'<rect x="12" y="28" width="76" height="50" rx="2" fill="none" stroke="{TEAL}" stroke-width="6"/>'
             f'<path d="M15 31 L50 58 L85 31" {STROKE} stroke="{TEAL}" stroke-width="6"/>'
             + heart_at(50, 18, 0.20, ROSE))


# ---------- run ----------

def main():
    # Cyrillic alphabet — teal, the page accent, in the site's serif
    names = {
        "А": "a", "Б": "b", "В": "v", "Г": "g", "Д": "d", "Е": "e", "Ё": "yo",
        "Ж": "zh", "З": "z", "И": "i", "Й": "j", "К": "k", "Л": "l", "М": "m",
        "Н": "n", "О": "o", "П": "p", "Р": "r", "С": "s", "Т": "t", "У": "u",
        "Ф": "f", "Х": "h", "Ц": "ts", "Ч": "ch", "Ш": "sh", "Щ": "shch",
        "Ъ": "hard", "Ы": "y", "Ь": "soft", "Э": "e2", "Ю": "yu", "Я": "ya",
    }
    cap = _ref_scale("А", 76)   # common scale so all caps share one height
    for ch, tr in names.items():
        glyph(f"letter_{tr}", ch, TEAL, cap)
    # digits — cream, lining figures at the same cap height
    dig = _ref_scale("0", 76)
    for i in range(10):
        glyph(f"digit_{i}", str(i), CREAM, dig)
    # punctuation
    glyph("exclaim", "!", ROSE, cap)
    glyph("question", "?", TEAL_L, cap)

    doodles()

    n = len([f for f in os.listdir(OUT) if f.endswith(".png")])
    print(f"\n{n} emojis in {OUT}")


if __name__ == "__main__":
    main()
