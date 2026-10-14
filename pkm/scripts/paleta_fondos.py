"""Calcula el color dominante de cada imagen de fondos/ y lo embebe en visor.html.

El visor usa ese color (tono y saturación) para adaptar la paleta de la pantalla al fondo,
y la luminosidad media para decidir qué fondos sirven en modo claro.

Uso: python scripts/paleta_fondos.py   (correrlo cada vez que se agregan o cambian fondos)
"""
import json, re
from pathlib import Path
import numpy as np
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
VISOR = RAIZ / "visor.html"
FONDOS = RAIZ / "fondos"
EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}


def analizar(p: Path) -> dict:
    im = Image.open(p).convert("RGB")
    im.thumbnail((160, 160))
    hsv = np.asarray(im.convert("HSV"), dtype=float) / 255.0
    rgb = np.asarray(im, dtype=float) / 255.0
    lum = float((0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]).mean())
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    vivos = (s > 0.22) & (v > 0.25) & (v < 0.98)
    if vivos.sum() < 20:  # imagen casi sin color: tono neutro
        return {"h": 191, "s": 60, "lum": round(lum, 3)}
    hh, ss, vv = h[vivos], s[vivos], v[vivos]
    peso = ss * vv
    bins = np.minimum((hh * 24).astype(int), 23)
    hist = np.bincount(bins, weights=peso, minlength=24)
    b = int(hist.argmax())
    sel = bins == b
    # promedio circular del tono dentro del bin ganador
    ang = hh[sel] * 2 * np.pi
    w = peso[sel]
    hue = (np.degrees(np.arctan2((np.sin(ang) * w).sum(), (np.cos(ang) * w).sum())) + 360) % 360
    return {"h": int(round(hue)), "s": int(round(float(np.average(ss[sel], weights=w)) * 100)), "lum": round(lum, 3)}


meta = {}
if FONDOS.exists():
    for p in sorted(FONDOS.iterdir()):
        if p.suffix.lower() in EXT:
            meta[f"fondos/{p.name}"] = analizar(p)

html = VISOR.read_text(encoding="utf-8")
nuevo = "/*FONDOS-START*/const FONDOS=" + json.dumps(meta, ensure_ascii=False, separators=(",", ":")) + ";/*FONDOS-END*/"
html, n = re.subn(r"/\*FONDOS-START\*/.*?/\*FONDOS-END\*/", lambda m: nuevo, html, count=1, flags=re.S)
if n != 1:
    raise SystemExit("No encontré los marcadores FONDOS-START/END en visor.html")
VISOR.write_text(html, encoding="utf-8", newline="")
for f, m in meta.items():
    print(f"{f:32} tono {m['h']:3}°  sat {m['s']:3}%  lum {m['lum']:.2f}")
print(f"{len(meta)} fondos embebidos")
