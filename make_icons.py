from PIL import Image, ImageDraw, ImageFont
import math

INK = (15, 31, 46, 255)
BRASS = (201, 162, 75, 255)
BRASS_SOFT = (140, 118, 66, 255)

def gradient_bg(size, c1, c2):
    img = Image.new('RGBA', (size, size))
    px = img.load()
    for y in range(size):
        t = y / (size - 1)
        r = int(c1[0] + (c2[0] - c1[0]) * t)
        g = int(c1[1] + (c2[1] - c1[1]) * t)
        b = int(c1[2] + (c2[2] - c1[2]) * t)
        for x in range(size):
            px[x, y] = (r, g, b, 255)
    return img

def rounded_mask(size, radius):
    mask = Image.new('L', (size, size), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    return mask

def draw_mark(size, maskable=False):
    # base square: navy background
    img = gradient_bg(size, (22, 41, 59), (15, 31, 46)).convert('RGBA')
    draw = ImageDraw.Draw(img)

    # For maskable icons, keep the glyph within the safe zone (center ~80%)
    safe = size * 0.62 if maskable else size * 0.9
    cx, cy = size / 2, size / 2

    # Draw a rounded brass square (the "brand mark" chip) with a percent-like glyph
    chip = safe * 0.62
    x0, y0 = cx - chip / 2, cy - chip / 2
    x1, y1 = cx + chip / 2, cy + chip / 2
    radius = chip * 0.24

    # gradient brass chip
    chip_img = gradient_bg(int(chip), BRASS[:3], BRASS_SOFT[:3]).convert('RGBA')
    chip_mask = rounded_mask(int(chip), int(radius))
    img.paste(chip_img, (int(x0), int(y0)), chip_mask)

    # Draw a simple percent glyph (two circles + diagonal line) in ink color
    glyph_size = chip
    lw = max(2, int(glyph_size * 0.09))
    r = glyph_size * 0.16

    # diagonal line
    pad = glyph_size * 0.22
    draw.line(
        [(x0 + pad, y1 - pad), (x1 - pad, y0 + pad)],
        fill=INK, width=lw
    )
    # top-left circle
    c1x, c1y = x0 + pad, y0 + pad
    draw.ellipse([c1x - r, c1y - r, c1x + r, c1y + r], outline=INK, width=lw)
    # bottom-right circle
    c2x, c2y = x1 - pad, y1 - pad
    draw.ellipse([c2x - r, c2y - r, c2x + r, c2y + r], outline=INK, width=lw)

    return img

def save_icon(size, maskable, path):
    img = draw_mark(size, maskable=maskable)
    img.save(path, 'PNG')

save_icon(192, False, 'icons/icon-192.png')
save_icon(512, False, 'icons/icon-512.png')
save_icon(192, True, 'icons/icon-maskable-192.png')
save_icon(512, True, 'icons/icon-maskable-512.png')

print('icons done')
