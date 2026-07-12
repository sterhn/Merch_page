#!/usr/bin/env python3
"""Generate a Telegram custom-emoji pack (100x100 transparent PNGs)
in the HEHEARSE merch page style: dark-mystical, teal + cream + tan + gold + rose,
hand-drawn doodle shapes, Neucha handwritten Cyrillic."""

import os
import cairosvg
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "pack")
os.makedirs(OUT, exist_ok=True)

FONT_PATH = os.path.join(HERE, "neucha.ttf")

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

def glyph(name, ch, color, target_h=76, max_w=92):
    font = ImageFont.truetype(FONT_PATH, 600)
    img = Image.new("RGBA", (1200, 1200), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.text((100, 100), ch, font=font, fill=color)
    bbox = img.getbbox()
    g = img.crop(bbox)
    scale = target_h / g.height
    if g.width * scale > max_w:
        scale = max_w / g.width
    w, h = max(1, round(g.width * scale)), max(1, round(g.height * scale))
    g = g.resize((w, h), Image.LANCZOS)
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    canvas.paste(g, ((SIZE - w) // 2, (SIZE - h) // 2), g)
    canvas.save(os.path.join(OUT, name + ".png"))
    print("chr ", name)


# ---------- doodle shapes ----------

ORN = ("M50 6 C54 34 66 46 94 50 C66 54 54 66 50 94 "
       "C46 66 34 54 6 50 C34 46 46 34 50 6 Z")  # the site's four-point star

HEART = ("M50 88 C20 64 10 46 14 30 C17 17 32 12 42 20 C46 23 49 27 50 30 "
         "C51 27 54 23 58 20 C68 12 83 17 86 30 C90 46 80 64 50 88 Z")

def heart_at(x, y, s, color):
    return (f'<g transform="translate({x} {y}) scale({s}) translate(-50 -50)">'
            f'<path d="{HEART}" fill="{color}"/></g>')

def orn_at(x, y, s, color, rot=0):
    return (f'<g transform="translate({x} {y}) rotate({rot}) scale({s}) translate(-50 -50)">'
            f'<path d="{ORN}" fill="{color}"/></g>')

STROKE = 'fill="none" stroke-linecap="round" stroke-linejoin="round"'

def doodles():
    # -- the site's ✦ ornament, three colors
    for cname, c in (("teal", TEAL), ("cream", CREAM), ("gold", GOLD)):
        save_svg(f"ornament_{cname}", f'<path d="{ORN}" fill="{c}"/>')

    # -- sparkle clusters
    save_svg("sparkles_teal",
             orn_at(42, 52, 0.72, TEAL) + orn_at(80, 26, 0.30, TEAL_L, 15)
             + f'<circle cx="76" cy="66" r="5" fill="{CREAM}"/>'
             + f'<circle cx="18" cy="22" r="4" fill="{TEAL_L}"/>')
    save_svg("sparkles_gold",
             orn_at(56, 44, 0.72, GOLD) + orn_at(20, 70, 0.30, CREAM, -12)
             + f'<circle cx="24" cy="24" r="5" fill="{TAN}"/>'
             + f'<circle cx="84" cy="78" r="4" fill="{GOLD}"/>')
    save_svg("sparkles_mixed",
             orn_at(34, 38, 0.55, TEAL) + orn_at(72, 60, 0.42, GOLD, 10)
             + orn_at(66, 20, 0.24, CREAM, -8)
             + f'<circle cx="26" cy="78" r="4.5" fill="{ROSE}"/>')

    # -- hearts
    for cname, c in (("teal", TEAL), ("rose", ROSE), ("cream", CREAM)):
        save_svg(f"heart_{cname}", f'<path d="{HEART}" fill="{c}"/>')
    for cname, c in (("teal", TEAL), ("rose", ROSE)):
        save_svg(f"heart_outline_{cname}",
                 f'<g transform="translate(50 50) scale(0.92) translate(-50 -50)">'
                 f'<path d="{HEART}" {STROKE} stroke="{c}" stroke-width="8"/></g>')
    save_svg("hearts_cluster",
             heart_at(38, 44, 0.62, TEAL) + heart_at(74, 66, 0.36, CREAM)
             + heart_at(72, 26, 0.26, ROSE))

    # -- five-point doodle stars
    star_pts = "50,7 61,37 92,39 68,59 77,90 50,72 23,90 32,59 8,39 39,37"
    for cname, c in (("teal", TEAL), ("gold", GOLD)):
        save_svg(f"star_{cname}",
                 f'<polygon points="{star_pts}" fill="{c}" stroke="{c}" '
                 f'stroke-width="6" stroke-linejoin="round"/>')
    save_svg("stars_cluster",
             f'<g transform="translate(34 36) scale(0.52) translate(-50 -50)">'
             f'<polygon points="{star_pts}" fill="{TEAL}" stroke="{TEAL}" stroke-width="6" stroke-linejoin="round"/></g>'
             f'<g transform="translate(74 62) scale(0.36) translate(-50 -50)">'
             f'<polygon points="{star_pts}" fill="{GOLD}" stroke="{GOLD}" stroke-width="6" stroke-linejoin="round"/></g>'
             f'<g transform="translate(70 20) scale(0.2) translate(-50 -50)">'
             f'<polygon points="{star_pts}" fill="{CREAM}" stroke="{CREAM}" stroke-width="6" stroke-linejoin="round"/></g>')

    # -- checks / crosses / plus
    CHECK = "M14 55 C24 61 33 71 38 80 C50 52 66 30 88 16"
    for cname, c in (("teal", TEAL), ("cream", CREAM)):
        save_svg(f"check_{cname}", f'<path d="{CHECK}" {STROKE} stroke="{c}" stroke-width="11"/>')
    save_svg("check_circle",
             f'<circle cx="50" cy="50" r="45" fill="{CREAM}"/>'
             f'<g transform="translate(50 52) scale(0.62) translate(-50 -50)">'
             f'<path d="{CHECK}" {STROKE} stroke="{TEAL_D}" stroke-width="15"/></g>')
    for cname, c in (("rose", ROSE), ("teal", TEAL)):
        save_svg(f"cross_{cname}",
                 f'<path d="M22 20 C40 40 60 60 80 82" {STROKE} stroke="{c}" stroke-width="11"/>'
                 f'<path d="M78 18 C60 40 42 60 20 80" {STROKE} stroke="{c}" stroke-width="11"/>')
    for cname, c in (("teal", TEAL), ("cream", CREAM)):
        save_svg(f"plus_{cname}",
                 f'<path d="M50 14 C51 38 49 62 50 86" {STROKE} stroke="{c}" stroke-width="11"/>'
                 f'<path d="M14 50 C40 48 64 52 86 50" {STROKE} stroke="{c}" stroke-width="11"/>')

    # -- arrows
    def arrow_right(c):
        return (f'<path d="M8 66 C26 42 54 34 82 44" {STROKE} stroke="{c}" stroke-width="9"/>'
                f'<path d="M82 44 L64 30 M82 44 L62 56" {STROKE} stroke="{c}" stroke-width="9"/>')
    save_svg("arrow_right_teal", arrow_right(TEAL))
    save_svg("arrow_right_cream", arrow_right(CREAM))
    save_svg("arrow_up_teal",
             f'<path d="M48 88 C44 62 45 36 52 12" {STROKE} stroke="{TEAL}" stroke-width="9"/>'
             f'<path d="M52 12 L34 30 M52 12 L68 30" {STROKE} stroke="{TEAL}" stroke-width="9"/>')
    save_svg("arrow_down_cream",
             f'<path d="M52 12 C56 38 55 64 48 88" {STROKE} stroke="{CREAM}" stroke-width="9"/>'
             f'<path d="M48 88 L32 70 M48 88 L66 70" {STROKE} stroke="{CREAM}" stroke-width="9"/>')

    # -- moon & sun
    save_svg("moon",
             f'<path d="M58 6 A44 44 0 1 0 58 94 A54 54 0 0 1 58 6 Z" fill="{TAN}"/>'
             + orn_at(76, 28, 0.24, CREAM, 12) + orn_at(84, 58, 0.16, CREAM, -10))
    rays = "".join(
        f'<path d="M50 50 L{50 + 46 * dx:.0f} {50 + 46 * dy:.0f}" {STROKE} stroke="{GOLD}" stroke-width="7" transform="translate({4 * dx:.1f} {4 * dy:.1f})"/>'
        for dx, dy in [(1, 0), (0.71, 0.71), (0, 1), (-0.71, 0.71), (-1, 0), (-0.71, -0.71), (0, -1), (0.71, -0.71)])
    save_svg("sun",
             f'<g transform="scale(0.9) translate(5.5 5.5)">{rays}'
             f'<circle cx="50" cy="50" r="24" fill="{CREAM}"/>'
             f'<path d="M50 38 C58 40 60 50 54 54 C48 58 42 52 46 47 C49 43 54 44 53 49" '
             f'{STROKE} stroke="{GOLD}" stroke-width="5"/></g>')

    # -- dots (irregular hand blobs)
    BLOB = ("M50 18 C70 14 84 30 82 52 C80 74 64 86 46 82 "
            "C28 78 16 62 20 44 C24 28 36 21 50 18 Z")
    for cname, c in (("teal", TEAL), ("cream", CREAM), ("rose", ROSE), ("gold", GOLD)):
        save_svg(f"dot_{cname}",
                 f'<g transform="translate(50 50) scale(0.6) translate(-50 -50)">'
                 f'<path d="{BLOB}" fill="{c}"/></g>')

    # -- bars & dividers
    for cname, c in (("teal", TEAL), ("cream", CREAM)):
        save_svg(f"bar_{cname}",
                 f'<rect x="41" y="12" width="18" height="76" rx="8" fill="{c}" '
                 f'transform="rotate(2 50 50)"/>')
    for cname, c in (("teal", TEAL), ("cream", CREAM), ("tan", TAN)):
        save_svg(f"line_{cname}",
                 f'<rect x="5" y="44" width="90" height="12" rx="6" fill="{c}" '
                 f'transform="rotate(-1.5 50 50)"/>')
    for cname, c in (("teal", TEAL), ("cream", CREAM)):
        save_svg(f"wave_{cname}",
                 f'<path d="M5 52 Q13 40 21 50 T37 50 T53 50 T69 50 T85 50 Q90 50 95 46" '
                 f'{STROKE} stroke="{c}" stroke-width="8"/>')

    # -- brackets
    save_svg("bracket_left",
             f'<path d="M64 11 C46 12 33 13 32 21 L30 78 C30 86 44 88 62 89" '
             f'{STROKE} stroke="{CREAM}" stroke-width="9"/>')
    save_svg("bracket_right",
             f'<path d="M36 11 C54 12 67 13 68 21 L70 78 C70 86 56 88 38 89" '
             f'{STROKE} stroke="{CREAM}" stroke-width="9"/>')
    save_svg("bracket_left_teal",
             f'<path d="M64 11 C46 12 33 13 32 21 L30 78 C30 86 44 88 62 89" '
             f'{STROKE} stroke="{TEAL}" stroke-width="9"/>')
    save_svg("bracket_right_teal",
             f'<path d="M36 11 C54 12 67 13 68 21 L70 78 C70 86 56 88 38 89" '
             f'{STROKE} stroke="{TEAL}" stroke-width="9"/>')

    # -- faces
    save_svg("face_happy",
             f'<circle cx="30" cy="34" r="6.5" fill="{TEAL}"/>'
             f'<circle cx="70" cy="34" r="6.5" fill="{TEAL}"/>'
             f'<path d="M20 56 C30 76 70 76 80 56" {STROKE} stroke="{TEAL}" stroke-width="10"/>')
    save_svg("face_content",
             f'<path d="M20 38 C26 28 36 28 42 38" {STROKE} stroke="{CREAM}" stroke-width="8"/>'
             f'<path d="M58 38 C64 28 74 28 80 38" {STROKE} stroke="{CREAM}" stroke-width="8"/>'
             f'<path d="M32 60 C40 71 60 71 68 60" {STROKE} stroke="{CREAM}" stroke-width="8"/>')
    save_svg("face_sad",
             f'<circle cx="30" cy="38" r="6.5" fill="{TEAL_D}"/>'
             f'<circle cx="70" cy="38" r="6.5" fill="{TEAL_D}"/>'
             f'<path d="M22 74 C32 58 68 58 78 74" {STROKE} stroke="{TEAL_D}" stroke-width="10"/>')
    save_svg("face_love",
             heart_at(30, 34, 0.30, ROSE) + heart_at(70, 34, 0.30, ROSE)
             + f'<path d="M24 58 C34 76 66 76 76 58" {STROKE} stroke="{ROSE}" stroke-width="9"/>')

    # -- lightbulb (idea)
    save_svg("lightbulb",
             f'<path d="M50 24 C64 24 74 34 74 47 C74 56 68 61 64 66 C61 70 60 74 60 78 L41 78 '
             f'C41 74 40 70 37 66 C33 61 27 56 27 47 C27 34 37 24 50 24 Z" '
             f'{STROKE} stroke="{CREAM}" stroke-width="7"/>'
             f'<path d="M43 78 C43 70 45 62 50 58 C55 62 57 70 57 78" {STROKE} stroke="{CREAM}" stroke-width="5"/>'
             f'<path d="M42 86 L59 86" {STROKE} stroke="{CREAM}" stroke-width="6"/>'
             f'<path d="M50 4 L50 13 M22 10 L27 19 M78 10 L73 19 M8 34 L17 38 M92 34 L83 38" '
             f'{STROKE} stroke="{GOLD}" stroke-width="6"/>')

    # -- asterisk bursts
    import math
    def burst(c, rot=0):
        lines = ""
        for i in range(6):
            a = math.radians(rot + i * 60)
            x1, y1 = 50 + 13 * math.cos(a), 50 + 13 * math.sin(a)
            x2, y2 = 50 + 42 * math.cos(a), 50 + 42 * math.sin(a)
            lines += f'<path d="M{x1:.1f} {y1:.1f} L{x2:.1f} {y2:.1f}" {STROKE} stroke="{c}" stroke-width="9"/>'
        return lines
    save_svg("burst_teal", burst(TEAL, 8))
    save_svg("burst_cream", burst(CREAM, -10))

    # -- bookmark flags
    for cname, c in (("teal", TEAL), ("rose", ROSE)):
        save_svg(f"flag_{cname}",
                 f'<path d="M30 10 C44 12 58 12 71 10 L72 86 C65 76 58 71 50 64 '
                 f'C43 71 36 78 29 87 Z" fill="{c}"/>')

    # -- envelope with heart
    save_svg("envelope",
             f'<rect x="12" y="26" width="76" height="52" rx="4" {STROKE} stroke="{TEAL}" stroke-width="7"/>'
             f'<path d="M14 30 C26 42 38 52 50 56 C62 52 74 42 86 30" {STROKE} stroke="{TEAL}" stroke-width="7"/>'
             + heart_at(50, 20, 0.22, ROSE))


# ---------- run ----------

def main():
    # Cyrillic alphabet — teal, the page accent
    names = {
        "А": "a", "Б": "b", "В": "v", "Г": "g", "Д": "d", "Е": "e", "Ё": "yo",
        "Ж": "zh", "З": "z", "И": "i", "Й": "j", "К": "k", "Л": "l", "М": "m",
        "Н": "n", "О": "o", "П": "p", "Р": "r", "С": "s", "Т": "t", "У": "u",
        "Ф": "f", "Х": "h", "Ц": "ts", "Ч": "ch", "Ш": "sh", "Щ": "shch",
        "Ъ": "hard", "Ы": "y", "Ь": "soft", "Э": "e2", "Ю": "yu", "Я": "ya",
    }
    for ch, tr in names.items():
        glyph(f"letter_{tr}", ch, TEAL)
    # digits — cream
    for i in range(10):
        glyph(f"digit_{i}", str(i), CREAM)
    # punctuation
    glyph("exclaim", "!", ROSE)
    glyph("question", "?", TEAL_L)

    doodles()

    n = len([f for f in os.listdir(OUT) if f.endswith(".png")])
    print(f"\n{n} emojis in {OUT}")


if __name__ == "__main__":
    main()
