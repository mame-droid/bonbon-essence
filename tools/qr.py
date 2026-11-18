"""QR code Bonbon Essence con il logo al centro, e biglietto da mettere nei pacchi.

Uso:  python tools/qr.py https://www.bonbonessence.com/ nome-file
Serve:  pip install segno pillow fonttools brotli
Crea in brand/qr/:
  - <nome>-qr.png        QR 2000×2000 px (stampabile fino a circa 17 cm a 300 dpi)
  - <nome>-biglietto.png biglietto 85×55 mm a 300 dpi (formato biglietto da visita)
"""
import io
import sys
from pathlib import Path

import segno
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "brand" / "qr"
INK, NUDE, CREAM, BRONZE = (58, 35, 21), (243, 223, 206), (251, 246, 242), (133, 86, 44)


def font(name, size):
    """Carica i caratteri del sito (woff2) convertendoli al volo per Pillow."""
    f = TTFont(ROOT / "site" / "assets" / "fonts" / name)
    f.flavor = None
    buf = io.BytesIO()
    f.save(buf)
    buf.seek(0)
    return ImageFont.truetype(buf, size)


def round_logo(size):
    logo = Image.open(ROOT / "brand" / "logo-512.png").convert("RGBA").resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size * 4, size * 4), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size * 4 - 1, size * 4 - 1), fill=255)
    logo.putalpha(mask.resize((size, size), Image.LANCZOS))
    return logo


def make_qr(url, px=2000):
    # Correzione d'errore alta (H): il QR resta leggibile anche con il logo sopra.
    qr = segno.make(url, error="h", micro=False)
    buf = io.BytesIO()
    qr.save(buf, kind="png", scale=40, border=4, dark="#3A2315", light="#FBF6F2")
    img = Image.open(buf).convert("RGBA").resize((px, px), Image.NEAREST)
    # Logo al centro su un disco chiaro (circa il 22% del lato).
    d = round(px * 0.22)
    pad = round(d * 0.12)
    disc = Image.new("RGBA", (d + 2 * pad, d + 2 * pad), (0, 0, 0, 0))
    ImageDraw.Draw(disc).ellipse((0, 0, disc.width - 1, disc.height - 1), fill=CREAM + (255,))
    img.alpha_composite(disc, ((px - disc.width) // 2, (px - disc.height) // 2))
    img.alpha_composite(round_logo(d), ((px - d) // 2, (px - d) // 2))
    return img.convert("RGB")


def make_card(url, qr):
    # 85×55 mm a 300 dpi
    W, H = 1004, 650
    card = Image.new("RGB", (W, H), CREAM)
    draw = ImageDraw.Draw(card)
    draw.rectangle((0, 0, W - 1, H - 1), outline=NUDE, width=6)
    q = 470
    card.paste(qr.resize((q, q), Image.LANCZOS), (W - q - 60, (H - q) // 2))
    logo = round_logo(150)
    card.paste(logo, (60, 70), logo)
    title = font("CormorantGaramond-normal-500-latin.woff2", 58)
    italic = font("CormorantGaramond-italic-500-latin.woff2", 46)
    body = font("Jost-normal-400-latin.woff2", 27)
    small = font("Jost-normal-500-latin.woff2", 21)
    x = 60
    draw.text((x, 250), "Merci !", font=title, fill=INK)
    draw.text((x, 318), "Heritage. Elegance.", font=italic, fill=BRONZE)
    draw.text((x, 368), "Essence.", font=italic, fill=BRONZE)
    draw.text((x, 448), "Scannez pour retrouver", font=body, fill=INK)
    draw.text((x, 484), "nos parfums", font=body, fill=INK)
    label = url.replace("https://", "").replace("http://", "").rstrip("/")
    draw.text((x, 560), label.upper(), font=small, fill=BRONZE, spacing=4)
    return card


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    url, name = sys.argv[1], sys.argv[2]
    OUT.mkdir(parents=True, exist_ok=True)
    qr = make_qr(url)
    qr.save(OUT / f"{name}-qr.png", optimize=True)
    make_card(url, qr).save(OUT / f"{name}-biglietto.png", dpi=(300, 300), optimize=True)
    print("ok:", OUT / f"{name}-qr.png", OUT / f"{name}-biglietto.png")
