#!/usr/bin/env python3
"""Generate HEHEARSE Telegram custom emoji PNGs.

Renders Cyrillic letters and numbers from the Concrete font,
symbol/decorative icons from Majesticons (MIT), and fandom markers.
All output is 100x100 transparent PNGs ready for Telegram upload.
"""

import argparse
import json
import math
import os
import struct
import sys
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

try:
    import cairosvg
except ImportError:
    cairosvg = None

REPO_ROOT = Path(__file__).resolve().parent.parent
TOOLS_DIR = Path(__file__).resolve().parent
EMOJI_DIR = TOOLS_DIR / "emojis"
CONCRETE_FONT = REPO_ROOT / "assets" / "fonts" / "concrete-regular.otf"

SIZE = 100

COLORS = {
    "teal": "#4a8f8f",
    "teal_accent": "#5aa0a0",
    "gold": "#a3854e",
    "berry": "#a64b6b",
    "lavender": "#7b6ba4",
    "sage": "#5a8a6e",
    "cream": "#ede5da",
}

FANDOM_COLORS = ["teal", "gold", "berry", "lavender", "sage"]

CYRILLIC_UPPER = list("АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ")
CYRILLIC_TRANSLIT = [
    "a", "be", "ve", "ge", "de", "ye", "yo", "zhe", "ze",
    "i", "short_i", "ka", "el", "em", "en", "o", "pe",
    "er", "es", "te", "u", "ef", "kha", "tse", "che",
    "sha", "shcha", "hard", "y", "soft", "e_rev", "yu", "ya",
]
CYRILLIC_EMOJI_MAP = [
    "🇦", "🅱️", "🔤", "🔤", "🔤", "🔤", "🔤", "🔤", "🔤",
    "ℹ️", "🔤", "🔤", "🔤", "Ⓜ️", "🔤", "⭕", "🔤",
    "🔤", "🔤", "🔤", "🔤", "🔤", "🔤", "🔤", "🔤",
    "🔤", "🔤", "🔤", "🔤", "🔤", "🔤", "🔤", "🔤",
]

DIGITS = list("0123456789")
DIGIT_EMOJI_MAP = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"]

# Majesticons solid SVGs (MIT license, https://github.com/halfmage/majesticons)
# viewBox is 0 0 24 24 for all
ICON_SVGS = {
    "heart": '<path fill="{color}" stroke="{color}" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 4c-3.2 0-5 2.667-5 4 0-1.333-1.8-4-5-4S3 6.667 3 8c0 7 9 12 9 12s9-5 9-12c0-1.333-.8-4-4-4z"/>',
    "star": '<path fill="{color}" stroke="{color}" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m14.674 6.45.673-3.285 2.225 2.51 3.027-.294-1.768 3.062 1.743 2.639-3.286-.673-2.51 2.225.19-3.156-3.062-1.768 2.768-1.26z"/>',
    "bookmark": '<path fill="{color}" fill-rule="evenodd" d="M7 2a3 3 0 0 0-3 3v15.138a1.5 1.5 0 0 0 2.244 1.303l5.26-3.006a1 1 0 0 1 .992 0l5.26 3.006A1.5 1.5 0 0 0 20 20.138V5a3 3 0 0 0-3-3H7z" clip-rule="evenodd"/>',
    "lightning": '<path fill="{color}" stroke="{color}" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 14 14 3v7h6L10 21v-7H4z"/>',
    "arrow_right": '<path stroke="{color}" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="m19 12-6-6m6 6-6 6m6-6H5"/>',
    "arrow_left": '<path stroke="{color}" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="m5 12 6-6m-6 6 6 6m-6-6h14"/>',
    "plus": '<path stroke="{color}" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 12h7m7 0h-7m0 0V5m0 7v7"/>',
    "minus": '<path stroke="{color}" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 12h14"/>',
    "question": '<path fill="{color}" fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 7a1 1 0 0 0-1 1 1 1 0 1 1-2 0 3 3 0 1 1 4.44 2.633 1.404 1.404 0 0 0-.383.288.303.303 0 0 0-.057.085v.494a1 1 0 1 1-2 0V13c0-.58.253-1.047.539-1.38.281-.33.63-.572.94-.742A1 1 0 0 0 12 9zm.999 4.011v-.004.005zM12 15a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H12z" clip-rule="evenodd"/>',
    "exclamation": '<path fill="{color}" fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 5a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0V8a1 1 0 0 1 1-1zm1 9a1 1 0 1 0-2 0 1 1 0 1 0 2 0z" clip-rule="evenodd"/>',
    "dollar": '<path fill="{color}" fill-rule="evenodd" d="M1 12C1 5.925 5.925 1 12 1s11 4.925 11 11-4.925 11-11 11S1 18.075 1 12zm12-6a1 1 0 1 0-2 0v1a3 3 0 0 0 0 6h2a1 1 0 1 1 0 2H9a1 1 0 1 0 0 2h2v1a1 1 0 1 0 2 0v-1a3 3 0 1 0 0-6h-2a1 1 0 1 1 0-2h4a1 1 0 1 0 0-2h-2V6z" clip-rule="evenodd"/>',
    "chat": '<path fill="{color}" stroke="{color}" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 1 0-7.605-4.185L3 21l4.185-1.395A8.958 8.958 0 0 0 12 21z"/>',
    "three_dots": '<path stroke="{color}" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 12h.01M8 12h.01M16 12h.01"/>',
    "eye": '<path fill="{color}" fill-rule="evenodd" d="M4.19 7.262C5.94 5.577 8.517 4 12 4c3.483 0 6.06 1.577 7.81 3.262a15.086 15.086 0 0 1 3.001 4.11c.193.399.193.857 0 1.255a15.086 15.086 0 0 1-3 4.111C18.06 18.423 15.483 20 12 20c-3.483 0-6.06-1.577-7.81-3.262a15.088 15.088 0 0 1-3.001-4.11 1.435 1.435 0 0 1 0-1.255 15.088 15.088 0 0 1 3-4.111zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" clip-rule="evenodd"/>',
    "tag": '<path fill="{color}" fill-rule="evenodd" d="M2 5a3 3 0 0 1 3-3h6.172a3 3 0 0 1 2.12.879l8 8a3 3 0 0 1 0 4.242l-6.17 6.172a3 3 0 0 1-4.243 0l-8-8A3 3 0 0 1 2 11.172V5zm5 1a1 1 0 0 0 0 2h.001a1 1 0 0 0 0-2H7z" clip-rule="evenodd"/>',
    "code": '<path stroke="{color}" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="m8 7-5 5 5 5m8 0 5-5-5-5"/>',
}

ICON_EMOJI_MAP = {
    "heart": "❤️",
    "star": "⭐",
    "bookmark": "🔖",
    "lightning": "⚡",
    "arrow_right": "➡️",
    "arrow_left": "⬅️",
    "plus": "➕",
    "minus": "➖",
    "question": "❓",
    "exclamation": "❗",
    "dollar": "💲",
    "chat": "💬",
    "three_dots": "💬",
    "eye": "👁️",
    "tag": "🏷️",
    "code": "💻",
}


def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def render_text_emoji(char, color_hex, font_path, output_path, target_fill=0.75):
    """Render a single character centered on a 100x100 transparent canvas."""
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    rgb = hex_to_rgb(color_hex)

    font_size = 78
    best_size = font_size
    for fs in range(78, 30, -2):
        font = ImageFont.truetype(str(font_path), fs)
        bbox = font.getbbox(char)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        if w <= SIZE * target_fill and h <= SIZE * target_fill:
            best_size = fs
            break

    font = ImageFont.truetype(str(font_path), best_size)
    bbox = font.getbbox(char)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    x = (SIZE - w) / 2 - bbox[0]
    y = (SIZE - h) / 2 - bbox[1]

    draw.text((x, y), char, fill=(*rgb, 255), font=font)
    img.save(str(output_path), "PNG")


def render_icon_emoji(icon_name, color_hex, output_path, icon_size=66):
    """Render a Majesticons SVG icon as a 100x100 PNG."""
    if cairosvg is None:
        print(f"  [SKIP] cairosvg not installed, skipping {icon_name}")
        return False

    svg_inner = ICON_SVGS[icon_name].format(color=color_hex)
    padding = (SIZE - icon_size) // 2
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'width="{SIZE}" height="{SIZE}" viewBox="0 0 {SIZE} {SIZE}">'
        f'<g transform="translate({padding},{padding}) scale({icon_size/24})">'
        f'{svg_inner}'
        f'</g></svg>'
    )

    png_data = cairosvg.svg2png(bytestring=svg.encode("utf-8"),
                                 output_width=SIZE, output_height=SIZE)
    with open(str(output_path), "wb") as f:
        f.write(png_data)
    return True


def render_dot(color_hex, output_path, radius=12):
    """Render a simple filled circle."""
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    rgb = hex_to_rgb(color_hex)
    cx, cy = SIZE // 2, SIZE // 2
    draw.ellipse(
        [cx - radius, cy - radius, cx + radius, cy + radius],
        fill=(*rgb, 255),
    )
    img.save(str(output_path), "PNG")


def render_fandom_label(text, color_hex, font_path, output_path):
    """Render a fandom abbreviation with bracket ornaments."""
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    rgb = hex_to_rgb(color_hex)

    font_size = 36
    if len(text) > 3:
        font_size = 30

    try:
        font = ImageFont.truetype(str(font_path), font_size)
    except (OSError, IOError):
        font = ImageFont.load_default()

    bracket_font_size = font_size + 4
    try:
        bfont = ImageFont.truetype(str(font_path), bracket_font_size)
    except (OSError, IOError):
        bfont = font

    full_text = f"[ {text} ]"
    bbox = font.getbbox(full_text)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    x = (SIZE - w) / 2 - bbox[0]
    y = (SIZE - h) / 2 - bbox[1]

    draw.text((x, y), full_text, fill=(*rgb, 200), font=font)
    img.save(str(output_path), "PNG")


def download_font(url, cache_path):
    """Download a font file if not cached."""
    if cache_path.exists():
        return cache_path
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    print(f"  Downloading font to {cache_path.name}...")
    urllib.request.urlretrieve(url, str(cache_path))
    return cache_path


def generate_preview_html(manifest, output_path, emoji_dir=None):
    """Generate an HTML preview grid with embedded base64 images."""
    import base64

    if emoji_dir is None:
        emoji_dir = output_path.parent

    html = [
        "<!DOCTYPE html><html><head><meta charset='utf-8'>",
        "<title>HEHEARSE Emoji Preview</title>",
        "<style>",
        "body { background: #110e16; color: #ede5da; font-family: system-ui; ",
        "  padding: 24px; }",
        "h1 { font-size: 1.4rem; letter-spacing: .08em; text-transform: uppercase; ",
        "  color: #5aa0a0; margin-bottom: 8px; }",
        "h2 { font-size: .9rem; letter-spacing: .06em; text-transform: uppercase; ",
        "  color: #9b8f81; margin: 24px 0 12px; }",
        ".grid { display: flex; flex-wrap: wrap; gap: 8px; }",
        ".item { width: 64px; text-align: center; }",
        ".item img { width: 48px; height: 48px; ",
        "  background: rgba(90,160,160,0.08); border-radius: 6px; }",
        ".item span { display: block; font-size: 9px; color: #857a6e; ",
        "  margin-top: 2px; word-break: break-all; }",
        "</style></head><body>",
        "<h1>HEHEARSE Emoji Pack</h1>",
        f"<p style='color:#9b8f81;font-size:13px'>{len(manifest)} emoji total</p>",
    ]

    categories = {}
    for entry in manifest:
        cat = entry["category"]
        categories.setdefault(cat, []).append(entry)

    cat_order = ["letter", "number", "icon_symbol", "icon_decorative",
                 "icon_star", "icon_heart", "icon_dot", "fandom"]
    for cat in cat_order:
        if cat not in categories:
            continue
        html.append(f"<h2>{cat.replace('_', ' ')}</h2><div class='grid'>")
        for e in categories[cat]:
            fn = e["filename"]
            fp = emoji_dir / fn
            if fp.exists():
                b64 = base64.b64encode(fp.read_bytes()).decode("ascii")
                src = f"data:image/png;base64,{b64}"
            else:
                src = fn
            html.append(
                f"<div class='item'><img src='{src}'><span>{fn[:-4]}</span></div>"
            )
        html.append("</div>")

    html.append("</body></html>")
    with open(str(output_path), "w") as f:
        f.write("\n".join(html))


def main():
    parser = argparse.ArgumentParser(description="Generate HEHEARSE emoji PNGs")
    parser.add_argument("--output-dir", default=str(EMOJI_DIR))
    parser.add_argument("--font", help="Override path to display font")
    parser.add_argument("--preview", action="store_true",
                        help="Generate HTML preview grid")
    parser.add_argument("--dry-run", action="store_true",
                        help="List what would be generated without rendering")
    args = parser.parse_args()

    out_dir = Path(args.output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    display_font = Path(args.font) if args.font else CONCRETE_FONT
    if not display_font.exists():
        print(f"ERROR: Font not found at {display_font}")
        sys.exit(1)

    # IBM Plex Sans for fandom labels
    plex_cache = TOOLS_DIR / "fonts" / "IBMPlexSans-Bold.ttf"
    plex_url = ("https://fonts.gstatic.com/s/ibmplexsans/v23/"
                "zYXGKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1swZSAXcomDVmadSDDV5zAA.ttf")
    try:
        sans_font = download_font(plex_url, plex_cache)
    except Exception as e:
        print(f"  Warning: Could not download IBM Plex Sans ({e}), using display font")
        sans_font = display_font

    manifest = []
    count = 0

    # --- Cyrillic letters ---
    print("Generating Cyrillic letters...")
    for char, translit, emoji in zip(CYRILLIC_UPPER, CYRILLIC_TRANSLIT, CYRILLIC_EMOJI_MAP):
        fn = f"letter_{translit}_teal.png"
        entry = {
            "filename": fn,
            "character": char,
            "color_name": "teal",
            "color_hex": COLORS["teal"],
            "category": "letter",
            "emoji_list": [emoji],
        }
        manifest.append(entry)
        if not args.dry_run:
            render_text_emoji(char, COLORS["teal"], display_font, out_dir / fn)
        count += 1

    # --- Numbers ---
    print("Generating numbers...")
    for digit, emoji in zip(DIGITS, DIGIT_EMOJI_MAP):
        fn = f"num_{digit}_gold.png"
        entry = {
            "filename": fn,
            "character": digit,
            "color_name": "gold",
            "color_hex": COLORS["gold"],
            "category": "number",
            "emoji_list": [emoji],
        }
        manifest.append(entry)
        if not args.dry_run:
            render_text_emoji(digit, COLORS["gold"], display_font, out_dir / fn)
        count += 1

    # --- Symbol icons ---
    print("Generating symbol icons...")
    symbol_icons = [
        ("question", "teal_accent", "❓"),
        ("exclamation", "teal_accent", "❗"),
        ("dollar", "teal_accent", "💲"),
        ("tag", "teal_accent", "🏷️"),
        ("plus", "teal_accent", "➕"),
        ("minus", "teal_accent", "➖"),
        ("arrow_right", "teal_accent", "➡️"),
        ("arrow_left", "teal_accent", "⬅️"),
        ("code", "teal_accent", "💻"),
        ("chat", "teal_accent", "💬"),
        ("eye", "teal_accent", "👁️"),
    ]
    for icon_name, color_name, emoji in symbol_icons:
        fn = f"sym_{icon_name}_{color_name}.png"
        entry = {
            "filename": fn,
            "character": icon_name,
            "color_name": color_name,
            "color_hex": COLORS[color_name],
            "category": "icon_symbol",
            "emoji_list": [emoji],
        }
        manifest.append(entry)
        if not args.dry_run:
            render_icon_emoji(icon_name, COLORS[color_name], out_dir / fn)
        count += 1

    # --- Decorative icons (teal) ---
    print("Generating decorative icons...")
    deco_icons = [
        ("lightning", "teal_accent", "⚡"),
        ("bookmark", "teal_accent", "🔖"),
    ]
    for icon_name, color_name, emoji in deco_icons:
        fn = f"deco_{icon_name}_{color_name}.png"
        entry = {
            "filename": fn,
            "character": icon_name,
            "color_name": color_name,
            "color_hex": COLORS[color_name],
            "category": "icon_decorative",
            "emoji_list": [emoji],
        }
        manifest.append(entry)
        if not args.dry_run:
            render_icon_emoji(icon_name, COLORS[color_name], out_dir / fn)
        count += 1

    # --- Stars in fandom colors ---
    print("Generating fandom stars...")
    for color_name in FANDOM_COLORS:
        fn = f"star_{color_name}.png"
        entry = {
            "filename": fn,
            "character": "star",
            "color_name": color_name,
            "color_hex": COLORS[color_name],
            "category": "icon_star",
            "emoji_list": ["⭐"],
        }
        manifest.append(entry)
        if not args.dry_run:
            render_icon_emoji("star", COLORS[color_name], out_dir / fn)
        count += 1

    # --- Hearts in 3 colors (small & cute) ---
    print("Generating hearts...")
    heart_colors = [("teal", "💚"), ("berry", "❤️"), ("lavender", "💜")]
    for color_name, emoji in heart_colors:
        fn = f"heart_{color_name}.png"
        entry = {
            "filename": fn,
            "character": "heart",
            "color_name": color_name,
            "color_hex": COLORS[color_name],
            "category": "icon_heart",
            "emoji_list": [emoji],
        }
        manifest.append(entry)
        if not args.dry_run:
            render_icon_emoji("heart", COLORS[color_name], out_dir / fn, icon_size=48)
        count += 1

    # --- Dot bullets in all colors ---
    print("Generating dot bullets...")
    dot_colors = [
        ("teal", "🟢"), ("teal_accent", "🟢"), ("gold", "🟡"),
        ("berry", "🔴"), ("lavender", "🟣"), ("sage", "🟢"), ("cream", "⚪"),
    ]
    for color_name, emoji in dot_colors:
        fn = f"dot_{color_name}.png"
        entry = {
            "filename": fn,
            "character": "dot",
            "color_name": color_name,
            "color_hex": COLORS[color_name],
            "category": "icon_dot",
            "emoji_list": [emoji],
        }
        manifest.append(entry)
        if not args.dry_run:
            render_dot(COLORS[color_name], out_dir / fn)
        count += 1

    # --- Fandom markers ---
    print("Generating fandom markers...")
    fandoms = [
        ("ORV", "teal", "📖"),
        ("MSCH", "gold", "⚔️"),
        ("GS", "berry", "👻"),
        ("OC", "lavender", "🎨"),
    ]
    for text, color_name, emoji in fandoms:
        fn = f"fandom_{text.lower()}.png"
        entry = {
            "filename": fn,
            "character": text,
            "color_name": color_name,
            "color_hex": COLORS[color_name],
            "category": "fandom",
            "emoji_list": [emoji],
        }
        manifest.append(entry)
        if not args.dry_run:
            render_fandom_label(text, COLORS[color_name], sans_font, out_dir / fn)
        count += 1

    # Write manifest
    manifest_path = out_dir / "manifest.json"
    with open(str(manifest_path), "w") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    # Verify sizes
    if not args.dry_run:
        oversized = []
        wrong_size = []
        for entry in manifest:
            fp = out_dir / entry["filename"]
            if not fp.exists():
                continue
            if fp.stat().st_size > 256 * 1024:
                oversized.append(entry["filename"])
            img = Image.open(fp)
            if img.size != (SIZE, SIZE):
                wrong_size.append((entry["filename"], img.size))

        if oversized:
            print(f"\n  WARNING: {len(oversized)} files exceed 256KB: {oversized}")
        if wrong_size:
            print(f"\n  WARNING: {len(wrong_size)} files not {SIZE}x{SIZE}: {wrong_size}")

    print(f"\nGenerated {count} emoji in {out_dir}/")
    print(f"Manifest: {manifest_path}")

    if args.preview:
        preview_path = out_dir / "preview.html"
        generate_preview_html(manifest, preview_path)
        print(f"Preview: {preview_path}")


if __name__ == "__main__":
    main()
