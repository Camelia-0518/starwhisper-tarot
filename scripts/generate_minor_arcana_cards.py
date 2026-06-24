from __future__ import annotations

import math
import random
import shutil
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
MINOR_ROOT = ROOT / "minor_arcana_56"
PUBLIC_CARDS = ROOT / "app" / "public" / "cards"

CARD_SIZE = (600, 1050)
GOLD = (205, 168, 76, 255)
GOLD_BRIGHT = (238, 214, 156, 255)
NAVY_WASH = (8, 14, 28, 255)
SUIT_ANCHORS = {
    "cups": MINOR_ROOT / "cups" / "cups-2.png",
    "swords": MINOR_ROOT / "swords" / "swords-3.png",
    "pentacles": MINOR_ROOT / "pentacles" / "pentacles-1.png",
}
SUIT_TINTS = {
    "wands": (225, 146, 84, 255),
    "cups": (164, 198, 236, 255),
    "swords": (214, 224, 236, 255),
    "pentacles": (213, 189, 118, 255),
}
COURTS = ("page", "knight", "queen", "king")


def ensure_output_dir() -> None:
    PUBLIC_CARDS.mkdir(parents=True, exist_ok=True)


def iter_expected_names() -> Iterable[str]:
    for suit in ("wands", "cups", "swords", "pentacles"):
        for number in range(1, 11):
            yield f"{suit}-{number}.png"
        for court in COURTS:
            yield f"{suit}-{court}.png"


def source_map() -> dict[str, Path]:
    files: dict[str, Path] = {}
    for suit_dir in MINOR_ROOT.iterdir():
        if not suit_dir.is_dir():
            continue
        for path in suit_dir.glob("*.png"):
            files[path.name] = path
    return files


def resize_cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    src_ratio = image.width / image.height
    dst_ratio = size[0] / size[1]
    if src_ratio > dst_ratio:
        new_height = size[1]
        new_width = round(new_height * src_ratio)
    else:
        new_width = size[0]
        new_height = round(new_width / src_ratio)
    resized = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
    left = (new_width - size[0]) // 2
    top = (new_height - size[1]) // 2
    return resized.crop((left, top, left + size[0], top + size[1]))


def open_card(path: Path) -> Image.Image:
    return resize_cover(Image.open(path).convert("RGBA"), CARD_SIZE)


def translucent(color: tuple[int, int, int, int], alpha: int) -> tuple[int, int, int, int]:
    return (color[0], color[1], color[2], alpha)


def add_vignette(image: Image.Image, strength: int = 132) -> None:
    mask = Image.new("L", CARD_SIZE, 0)
    draw = ImageDraw.Draw(mask)
    for i in range(18):
        inset = i * 9
        alpha = max(0, strength - i * 6)
        draw.rounded_rectangle(
            (inset, inset, CARD_SIZE[0] - inset, CARD_SIZE[1] - inset),
            radius=46,
            outline=alpha,
            width=12,
        )
    shadow = Image.new("RGBA", CARD_SIZE, (2, 3, 8, 255))
    image.alpha_composite(Image.composite(shadow, Image.new("RGBA", CARD_SIZE, (0, 0, 0, 0)), mask.filter(ImageFilter.GaussianBlur(36))))


def add_stars(image: Image.Image, seed: str, density: int = 140) -> None:
    rng = random.Random(seed)
    draw = ImageDraw.Draw(image, "RGBA")
    for _ in range(density):
        x = rng.randint(28, CARD_SIZE[0] - 28)
        y = rng.randint(36, CARD_SIZE[1] - 36)
        radius = rng.choice((1, 1, 1, 2, 2, 3))
        alpha = rng.randint(65, 155)
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(255, 233, 178, alpha))
        if radius > 1 and rng.random() > 0.6:
            draw.line((x - radius * 3, y, x + radius * 3, y), fill=(255, 228, 168, alpha // 2), width=1)
            draw.line((x, y - radius * 3, x, y + radius * 3), fill=(255, 228, 168, alpha // 2), width=1)


def add_gold_grain(image: Image.Image, seed: str) -> None:
    rng = random.Random(seed)
    layer = Image.new("RGBA", CARD_SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")
    for _ in range(360):
        x = rng.randint(18, CARD_SIZE[0] - 18)
        y = rng.randint(18, CARD_SIZE[1] - 18)
        draw.ellipse((x, y, x + 1, y + 1), fill=(255, 220, 148, rng.randint(18, 42)))
    image.alpha_composite(layer)


def add_suit_halo(image: Image.Image, suit: str, center: tuple[int, int], radius: int, alpha: int) -> None:
    layer = Image.new("RGBA", CARD_SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")
    tint = SUIT_TINTS[suit]
    draw.ellipse((center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius), fill=(tint[0], tint[1], tint[2], alpha))
    layer = layer.filter(ImageFilter.GaussianBlur(28))
    image.alpha_composite(layer)


def shared_finish(image: Image.Image, suit: str, seed: str) -> Image.Image:
    image = resize_cover(image.convert("RGBA"), CARD_SIZE)
    image = ImageEnhance.Contrast(image).enhance(1.08)
    image = ImageEnhance.Color(image).enhance(0.96)
    image = ImageEnhance.Brightness(image).enhance(0.95)
    wash = Image.new("RGBA", CARD_SIZE, NAVY_WASH)
    image = Image.blend(image, wash, 0.14)
    add_vignette(image)
    add_stars(image, f"stars-{seed}", density=110)
    add_gold_grain(image, f"grain-{seed}")
    return image


def build_template_base(suit: str, variant: int) -> Image.Image:
    base = open_card(SUIT_ANCHORS[suit])
    alt = open_card(SUIT_ANCHORS[suit])
    alt = ImageOps.mirror(alt) if variant % 2 else alt
    alt = alt.resize((630, 1102), Image.Resampling.LANCZOS).crop((15, 26, 615, 1076))
    alt = alt.filter(ImageFilter.GaussianBlur(1.4))
    base = Image.blend(base, alt, 0.24)

    matte = Image.new("L", CARD_SIZE, 0)
    draw = ImageDraw.Draw(matte)
    draw.ellipse((86, 140, 514, 930), fill=170)
    shade = Image.new("RGBA", CARD_SIZE, (9, 14, 26, 215))
    base.alpha_composite(Image.composite(shade, Image.new("RGBA", CARD_SIZE, (0, 0, 0, 0)), matte.filter(ImageFilter.GaussianBlur(42))))
    add_suit_halo(base, suit, (300, 392), 120, 46)
    return base


def draw_waterlines(draw: ImageDraw.ImageDraw, seed: str) -> None:
    rng = random.Random(seed)
    for row in range(6):
        y = 690 + row * 42 + rng.randint(-4, 4)
        left = 74 - row * 10
        right = 526 + row * 10
        draw.arc((left, y, right, y + 56), 6, 174, fill=(220, 196, 138, 56 - row * 6), width=2)


def draw_lotus(draw: ImageDraw.ImageDraw, x: int, y: int, scale: float) -> None:
    for idx in range(8):
        angle = math.radians(idx * 45)
        tip_x = x + math.cos(angle) * 16 * scale
        tip_y = y + math.sin(angle) * 9 * scale
        draw.polygon([(x, y), (tip_x, tip_y), (x + (tip_x - x) * 0.45, y + (tip_y - y) * 0.45)], fill=(244, 234, 216, 88))


def draw_chalice(draw: ImageDraw.ImageDraw, x: int, y: int, scale: float, glow: Image.Image) -> None:
    add_suit_halo(glow, "cups", (x, round(y - 10 * scale)), round(42 * scale), 68)
    cup = [
        (x - 28 * scale, y - 44 * scale),
        (x + 28 * scale, y - 44 * scale),
        (x + 18 * scale, y + 8 * scale),
        (x + 10 * scale, y + 38 * scale),
        (x - 10 * scale, y + 38 * scale),
        (x - 18 * scale, y + 8 * scale),
    ]
    draw.polygon(cup, fill=(42, 52, 82, 160), outline=GOLD_BRIGHT, width=max(1, round(3 * scale)))
    draw.arc((x - 16 * scale, y + 28 * scale, x + 16 * scale, y + 48 * scale), 0, 180, fill=GOLD_BRIGHT, width=max(1, round(3 * scale)))
    draw.rectangle((x - 3 * scale, y + 36 * scale, x + 3 * scale, y + 76 * scale), fill=GOLD_BRIGHT)
    draw.rounded_rectangle((x - 24 * scale, y + 74 * scale, x + 24 * scale, y + 84 * scale), radius=5, fill=(16, 24, 42, 170), outline=GOLD_BRIGHT, width=max(1, round(3 * scale)))
    draw.arc((x + 12 * scale, y - 22 * scale, x + 38 * scale, y + 18 * scale), 258, 108, fill=GOLD_BRIGHT, width=max(1, round(3 * scale)))


def draw_sword(draw: ImageDraw.ImageDraw, x: int, y: int, length: int, angle_deg: float, glow: Image.Image) -> None:
    angle = math.radians(angle_deg)
    tip = (x + math.sin(angle) * length, y - math.cos(angle) * length)
    hilt = (x - math.sin(angle) * length * 0.14, y + math.cos(angle) * length * 0.14)
    add_suit_halo(glow, "swords", (round((x + tip[0]) / 2), round((y + tip[1]) / 2)), 58, 62)
    draw.line((hilt, tip), fill=(242, 241, 237, 225), width=9)
    draw.line((hilt, tip), fill=(184, 198, 208, 190), width=3)
    cross = 30
    draw.line(
        (
            x - math.cos(angle) * cross,
            y - math.sin(angle) * cross,
            x + math.cos(angle) * cross,
            y + math.sin(angle) * cross,
        ),
        fill=GOLD_BRIGHT,
        width=5,
    )
    draw.ellipse((x - 8, y - 8, x + 8, y + 8), fill=GOLD, outline=GOLD_BRIGHT, width=2)


def draw_pentacle(draw: ImageDraw.ImageDraw, x: int, y: int, radius: int, glow: Image.Image) -> None:
    add_suit_halo(glow, "pentacles", (x, y), round(radius * 1.28), 72)
    draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(38, 28, 16, 168), outline=GOLD_BRIGHT, width=4)
    points = []
    for idx in range(5):
        angle = math.radians(-90 + idx * 72)
        points.append((x + math.cos(angle) * radius * 0.78, y + math.sin(angle) * radius * 0.78))
    order = [0, 2, 4, 1, 3, 0]
    for left, right in zip(order, order[1:]):
        draw.line((points[left], points[right]), fill=GOLD_BRIGHT, width=4)
    draw.ellipse((x - radius * 0.16, y - radius * 0.16, x + radius * 0.16, y + radius * 0.16), fill=GOLD_BRIGHT)


def positions_for_count(count: int, center_y: int, spread_x: int, spread_y: int) -> list[tuple[int, int]]:
    if count == 1:
        return [(300, center_y)]
    if count == 2:
        return [(220, center_y), (380, center_y)]
    if count == 3:
        return [(300, center_y - 90), (220, center_y + 74), (380, center_y + 74)]
    if count == 4:
        return [(220, center_y - 92), (380, center_y - 92), (220, center_y + 92), (380, center_y + 92)]
    if count == 5:
        return [(220, center_y - 108), (380, center_y - 108), (300, center_y), (220, center_y + 108), (380, center_y + 108)]
    points: list[tuple[int, int]] = []
    rows = math.ceil(count / 2)
    idx = 0
    for row in range(rows):
        y = round(center_y - (rows - 1) * spread_y / 2 + row * spread_y)
        xs = [300] if idx == count - 1 else [round(300 - spread_x / 2), round(300 + spread_x / 2)]
        for x in xs:
            points.append((x, y))
            idx += 1
            if idx >= count:
                break
    return points[:count]


def draw_court_ornament(draw: ImageDraw.ImageDraw, suit: str, court: str) -> None:
    if court == "page":
        points = [(300, 150), (310, 176), (338, 176), (316, 194), (324, 222), (300, 206), (276, 222), (284, 194), (262, 176), (290, 176)]
        draw.line(points + [points[0]], fill=GOLD_BRIGHT, width=3)
    elif court == "knight":
        draw.arc((156, 176, 444, 340), 208, 336, fill=(224, 202, 146, 136), width=4)
    elif court == "queen":
        crown = [(260, 196), (278, 150), (300, 188), (322, 150), (340, 196)]
        draw.line(crown, fill=GOLD_BRIGHT, width=4)
        for x, y in crown[1::2]:
            draw.ellipse((x - 4, y - 4, x + 4, y + 4), fill=GOLD_BRIGHT)
    elif court == "king":
        draw.arc((214, 150, 386, 290), 204, 336, fill=GOLD_BRIGHT, width=4)
        draw.line((232, 250, 368, 250), fill=GOLD_BRIGHT, width=4)


def render_cups_card(token: str, variant: int) -> Image.Image:
    image = build_template_base("cups", variant)
    glow = Image.new("RGBA", CARD_SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(image, "RGBA")

    add_suit_halo(image, "cups", (300, 228), 88, 42)
    draw.pieslice((240, 166, 360, 286), 42, 310, fill=(246, 232, 198, 98), outline=GOLD_BRIGHT)
    draw_waterlines(draw, f"cups-water-{variant}")
    for x, y in ((126, 738), (474, 748), (196, 852), (402, 888)):
        draw_lotus(draw, x, y, 1.0)

    if token.isdigit():
        count = int(token)
        scale = 0.9 if count <= 4 else 0.74 if count <= 8 else 0.64
        for x, y in positions_for_count(count, 560, 190, 150):
            draw_chalice(draw, x, y, scale, glow)
    else:
        draw_chalice(draw, 300, 548, 1.28, glow)
        draw_chalice(draw, 220, 658, 0.76, glow)
        draw_chalice(draw, 380, 658, 0.76, glow)
        draw_court_ornament(draw, "cups", token)

    image.alpha_composite(glow)
    return shared_finish(image, "cups", f"cups-{token}-{variant}")


def render_swords_card(token: str, variant: int) -> Image.Image:
    image = build_template_base("swords", variant)
    glow = Image.new("RGBA", CARD_SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(image, "RGBA")

    add_suit_halo(image, "swords", (300, 236), 72, 36)
    for row in range(6):
        y = 210 + row * 120
        draw.arc((58, y, 548, y + 100), 190, 334, fill=(214, 204, 176, 22 - row * 2), width=2)
    if token.isdigit():
        count = int(token)
        angles = [-28, 28, -16, 16, -40, 40, -8, 8, -54, 54]
        for idx, (x, y) in enumerate(positions_for_count(count, 530, 214, 146)):
            draw_sword(draw, x, y + 124, 178 if count <= 4 else 156 if count <= 8 else 138, angles[idx % len(angles)], glow)
    else:
        draw_sword(draw, 300, 610, 230, 2, glow)
        draw_sword(draw, 236, 664, 156, -24, glow)
        draw_sword(draw, 364, 664, 156, 24, glow)
        draw_court_ornament(draw, "swords", token)

    image.alpha_composite(glow)
    return shared_finish(image, "swords", f"swords-{token}-{variant}")


def render_pentacles_card(token: str, variant: int) -> Image.Image:
    image = build_template_base("pentacles", variant)
    glow = Image.new("RGBA", CARD_SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(image, "RGBA")

    draw.rounded_rectangle((164, 626, 436, 760), radius=22, fill=(18, 16, 12, 92), outline=(190, 160, 92, 98), width=2)
    for side_x in (78, 520):
        points = [(side_x, 150), (side_x - 12, 260), (side_x + 16, 388), (side_x - 8, 530), (side_x + 10, 690)]
        draw.line(points, fill=(168, 136, 78, 100), width=4)
    for x, y in ((140, 874), (454, 884), (222, 946), (380, 936)):
        draw.ellipse((x - 18, y - 12, x + 18, y + 12), fill=(128, 92, 38, 108), outline=(205, 168, 82, 120), width=2)

    if token.isdigit():
        count = int(token)
        radius = 44 if count <= 4 else 36 if count <= 8 else 30
        for x, y in positions_for_count(count, 434, 196, 154):
            draw_pentacle(draw, x, y, radius, glow)
    else:
        draw_pentacle(draw, 300, 466, 78, glow)
        draw_pentacle(draw, 208, 640, 42, glow)
        draw_pentacle(draw, 392, 640, 42, glow)
        draw_court_ornament(draw, "pentacles", token)

    image.alpha_composite(glow)
    return shared_finish(image, "pentacles", f"pentacles-{token}-{variant}")


def render_generated_card(name: str, variant: int) -> Image.Image:
    suit, token = name[:-4].split("-", 1)
    if suit == "cups":
        return render_cups_card(token, variant)
    if suit == "swords":
        return render_swords_card(token, variant)
    if suit == "pentacles":
        return render_pentacles_card(token, variant)
    raise ValueError(f"Unexpected generated suit: {suit}")


def process_original_source(path: Path, suit: str, name: str) -> Image.Image:
    image = open_card(path)
    return shared_finish(image, suit, f"original-{name}")


def write_all_minor_cards() -> tuple[int, int]:
    existing = source_map()
    generated = 0
    normalized = 0
    for index, name in enumerate(iter_expected_names()):
        suit = name.split("-", 1)[0]
        if name in existing:
            image = process_original_source(existing[name], suit, name)
            normalized += 1
        else:
            image = render_generated_card(name, index + len(name))
            generated += 1
        image.save(PUBLIC_CARDS / name, optimize=True)
    return normalized, generated


def main() -> None:
    ensure_output_dir()
    normalized, generated = write_all_minor_cards()
    print(f"Normalized existing cards: {normalized}")
    print(f"Regenerated cards: {generated}")


if __name__ == "__main__":
    main()
