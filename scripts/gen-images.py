#!/usr/bin/env python3
"""Generate original cinematic assets for AFTER YOU (no external copyrighted art)."""
import math, random
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageChops

OUT = "public/images"
random.seed(20261105)

def save(img, name, quality=85):
    img = img.convert("RGB")
    img.save(f"{OUT}/{name}", "JPEG", quality=quality, optimize=True, progressive=True)
    print(name, img.size)

def night_sky_gradient(w, h, top=(6, 7, 14), bottom=(26, 18, 48)):
    img = Image.new("RGB", (w, h))
    px = img.load()
    for y in range(h):
        t = y / (h - 1)
        r = int(top[0] + (bottom[0] - top[0]) * t)
        g = int(top[1] + (bottom[1] - top[1]) * t)
        b = int(top[2] + (bottom[2] - top[2]) * t)
        for x in range(w):
            px[x, y] = (r, g, b)
    return img

def stars(img, count=220, ymax=0.62, max_a=200):
    w, h = img.size
    d = ImageDraw.Draw(img, "RGBA")
    for _ in range(count):
        x = random.randrange(w); y = random.randrange(int(h * ymax))
        s = random.choice([1, 1, 1, 1, 2, 3])
        a = random.randrange(60, max_a)
        d.ellipse((x - s, y - s, x + s, y + s), fill=(222, 208, 255, a))

def moon(d, cx, cy, r, glow_strength=46):
    for rr in range(r + glow_strength, r, -2):
        a = max(0, int(glow_strength * (r + glow_strength - rr) / glow_strength))
        d.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), fill=(150, 116, 226, a // 3))
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(238, 228, 255, 250))
    d.ellipse((cx - r * 0.3, cy - r * 0.42, cx + r * 0.52, cy + r * 0.55), fill=(196, 178, 235, 40))

# 1) Hero: rainy window over purple city night -------------------------------
def hero():
    w, h = 1920, 1080
    img = night_sky_gradient(w, h, (5, 5, 12), (24, 15, 46))
    d = ImageDraw.Draw(img, "RGBA")
    # distant city bokeh
    for _ in range(220):
        x = random.randrange(w); y = random.randrange(int(h * 0.55))
        r = random.randrange(2, 12); a = random.randrange(25, 90)
        tone = random.choice([(167, 139, 250), (255, 214, 165), (196, 181, 253), (122, 96, 208)])
        d.ellipse((x - r, y - r, x + r, y + r), fill=tone + (a,))
    stars(img, 130, 0.5)
    moon(d, 1420, 210, 110)
    # skyline silhouette
    horizon = int(h * 0.66)
    for x in range(-40, w + 80, 46):
        bw = random.randrange(60, 150); bh = random.randrange(120, 330)
        d.rectangle((x, horizon - bh, x + bw, horizon), fill=(10, 8, 26, 240))
        for wx in range(x + 12, x + bw - 8, 26):
            for wy in range(horizon - bh + 18, horizon - 14, 34):
                if random.random() < 0.30:
                    d.rectangle((wx, wy, wx + 6, wy + 9), fill=(188, 138, 255, 130))
    # window frame
    d.rectangle((0, 0, w - 1, h - 1), outline=(6, 6, 12, 255), width=26)
    d.rectangle((w // 2 - 14, 0, w // 2 + 14, h), fill=(5, 5, 10, 255))
    d.rectangle((0, h // 2 - 14, w, h // 2 + 14), fill=(5, 5, 10, 255))
    # glass: vertical light streaks
    streak = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sd = ImageDraw.Draw(streak)
    for _ in range(90):
        x = random.randrange(w)
        ln = random.randrange(40, 300)
        a = random.randrange(10, 46)
        sd.line((x, random.randrange(h), x + random.randrange(-6, 6), min(h, x + ln)), fill=(205, 190, 255, a), width=random.choice([1, 1, 2]))
    streak = streak.filter(ImageFilter.GaussianBlur(2))
    img = Image.alpha_composite(img.convert("RGBA"), streak)
    # rain drops on glass
    for _ in range(240):
        x = random.randrange(w); y = random.randrange(h); r = random.randrange(1, 4)
        sd2 = ImageDraw.Draw(img)
        sd2.ellipse((x - r, y - r, x + r, y + r), fill=(190, 182, 230, random.randrange(28, 70)))
    # big soft bokeh drops
    drop = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    dd = ImageDraw.Draw(drop)
    for _ in range(14):
        x = random.randrange(w); y = random.randrange(h); r = random.randrange(10, 30)
        dd.ellipse((x - r, y - r, x + r, y + r), fill=(210, 196, 255, 26))
        dd.ellipse((x - r // 3, y - r // 2, x + r // 3, y + r // 3), fill=(230, 220, 255, 22))
    drop = drop.filter(ImageFilter.GaussianBlur(6))
    img = Image.alpha_composite(img, drop)
    img = ImageEnhance.Brightness(img).enhance(0.96)
    img = ImageEnhance.Contrast(img).enhance(1.06)
    save(img, "hero-rainy-window.jpg")

# 2) Letters: full moon over quiet purple city -------------------------------
def letters():
    w, h = 1600, 1000
    img = night_sky_gradient(w, h, (7, 7, 16), (30, 20, 55))
    d = ImageDraw.Draw(img, "RGBA")
    stars(img, 260, 0.6)
    moon(d, 1180, 250, 150)
    # clouds thin
    for _ in range(14):
        x = random.randrange(w); y = random.randrange(int(h * 0.5)); r = random.randrange(60, 170)
        d.ellipse((x - r, y - r // 4, x + r, y + r // 4), fill=(40, 28, 70, 26))
    horizon = int(h * 0.62)
    for x in range(-40, w + 80, 40):
        bw = random.randrange(60, 150); bh = random.randrange(100, 300)
        d.rectangle((x, horizon - bh, x + bw, horizon), fill=(11, 9, 28, 240))
        for wx in range(x + 12, x + bw - 8, 26):
            for wy in range(horizon - bh + 16, horizon - 12, 30):
                if random.random() < 0.26:
                    d.rectangle((wx, wy, wx + 6, wy + 9), fill=(180, 132, 255, 120))
    # water reflection of moon
    for i in range(30):
        a = 30 - i
        d.line((1180 - i * 14, horizon, 1180 - i * 20, h), fill=(150, 116, 226, max(0, a)))
        d.line((1180 + i * 14, horizon, 1180 + i * 20, h), fill=(150, 116, 226, max(0, a)))
    for y in range(horizon, h):
        d.line((0, y, w, y), fill=(8, 7, 20, random.randrange(4, 14)), width=1)
    img = img.filter(ImageFilter.GaussianBlur(0.4))
    save(img, "moon-city.jpg")

# 3) Music: empty street, purple lamps, fog ----------------------------------
def music():
    w, h = 1600, 1000
    img = night_sky_gradient(w, h, (9, 8, 18), (22, 15, 44))
    d = ImageDraw.Draw(img, "RGBA")
    stars(img, 150, 0.5, 150)
    moon(d, 260, 150, 80)
    # perspective street
    vp = (w * 0.5, h * 0.42)
    for y in range(int(h * 0.45), h, 2):
        t = (y - h * 0.45) / (h - h * 0.45)
        spread = 60 + 900 * t
        d.line((int(vp[0] - spread), y, int(vp[0] + spread), y), fill=(14, 12, 30, 220), width=2)
    # lamps along both sides with glow
    for side in (-1, 1):
        for i in range(5):
            x = int(vp[0] + side * (90 + i * 130)); y = int(h * 0.45 + i * 118)
            d.line((x, y, x, y - 70), fill=(8, 8, 16, 255), width=8)
            for rr in range(70, 12, -4):
                a = int(16 * (70 - rr) / 70)
                d.ellipse((x - rr, y - 70 - rr, x + rr, y - 70 + rr), fill=(168, 118, 255, a))
            d.ellipse((x - 14, y - 70 - 14, x + 14, y - 70 + 14), fill=(226, 208, 255, 235))
            # wet reflection
            for j in range(16):
                d.line((x - j * 3, y + j * 4, x + j * 3, y + j * 4), fill=(150, 108, 230, max(0, 40 - j * 3)), width=3)
    # lone silhouette walking away
    fx = int(vp[0] + 20); fy = int(h * 0.62)
    d.ellipse((fx - 14, fy - 40, fx + 14, fy - 12), fill=(6, 5, 14, 255))
    d.polygon([(fx - 26, fy - 12), (fx + 22, fy - 12), (fx + 34, fy + 60), (fx - 38, fy + 60)], fill=(6, 5, 14, 252))
    d.line((fx - 16, fy + 30, fx - 26, fy + 95), fill=(6, 5, 14, 255), width=9)
    d.line((fx + 12, fy + 30, fx + 22, fy + 95), fill=(6, 5, 14, 255), width=9)
    # fog layer
    fog = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    fd = ImageDraw.Draw(fog)
    for _ in range(26):
        x = random.randrange(-200, w + 200); y = random.randrange(int(h * 0.5), h + 100); r = random.randrange(120, 340)
        fd.ellipse((x - r, y - r // 3, x + r, y + r // 3), fill=(94, 76, 150, 10))
    fog = fog.filter(ImageFilter.GaussianBlur(40))
    img = Image.alpha_composite(img.convert("RGBA"), fog)
    save(img, "empty-street.jpg")

# 4) Healing: pre-dawn calm over a lake --------------------------------------
def healing():
    w, h = 1600, 1000
    img = Image.new("RGB", (w, h))
    px = img.load()
    for y in range(h):
        t = y / (h - 1)
        if t < 0.55:
            u = t / 0.55
            r = int(10 + 30 * u); g = int(9 + 16 * u); b = int(24 + 52 * u)
        else:
            u = (t - 0.55) / 0.45
            r = int(40 + 70 * u); g = int(25 + 50 * u); b = int(76 + 70 * u)
        for x in range(w):
            px[x, y] = (r, g, b)
    d = ImageDraw.Draw(img, "RGBA")
    stars(img, 120, 0.4, 120)
    # horizon glow (dawn)
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for i in range(80):
        a = int(3 * (80 - i) / 80)
        gd.ellipse((w // 2 - 260 - i * 8, int(h * 0.55) - 60 - i * 6, w // 2 + 260 + i * 8, int(h * 0.55) - 60 + i * 6), fill=(255, 170, 140, a))
    glow = glow.filter(ImageFilter.GaussianBlur(30))
    img = Image.alpha_composite(img.convert("RGBA"), glow)
    d = ImageDraw.Draw(img, "RGBA")
    # far mountains
    for i in range(6):
        pts = []
        for x in range(-60, w + 80, 40):
            pts.append((x, int(h * 0.55) - i * 14 - 40 * math.sin(x / 150 + i)))
        pts += [(w + 80, h), (-60, h)]
        d.polygon(pts, fill=(16 + i * 3, 12 + i * 3, 34 + i * 5, 230))
    # lake reflections
    for y in range(int(h * 0.62), h):
        t = (y - h * 0.62) / (h - h * 0.62)
        r = int(46 + 60 * t); g = int(30 + 34 * t); b = int(84 + 40 * t)
        d.line((0, y, w, y), fill=(r, g, b, 220), width=2)
    for j in range(40):
        x = w // 2 + random.randrange(-380, 380); y = int(h * 0.66) + random.randrange(0, 260)
        d.line((x - 40, y, x + 40, y), fill=(255, 180, 150, 12), width=2)
    img = img.filter(ImageFilter.GaussianBlur(0.5))
    save(img, "healing-dawn.jpg")

# 5) OG / fog road ------------------------------------------------------------
def fog():
    w, h = 1200, 630
    img = night_sky_gradient(w, h, (8, 7, 16), (26, 18, 50))
    d = ImageDraw.Draw(img, "RGBA")
    stars(img, 140, 0.5, 160)
    moon(d, 950, 140, 90)
    for _ in range(20):
        x = random.randrange(w); y = random.randrange(int(h * 0.55), h); r = random.randrange(80, 240)
        d.ellipse((x - r, y - r // 3, x + r, y + r // 3), fill=(88, 70, 140, 16))
    img = img.filter(ImageFilter.GaussianBlur(6))
    save(img, "og-night.jpg")

hero(); letters(); music(); healing(); fog()
print("assets done")
