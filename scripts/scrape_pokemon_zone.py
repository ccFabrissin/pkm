"""Descarga estadísticas de uso Reg M-C desde pokemon-zone.com -> data/db.json (clave "usage")

Por especie: movimientos, objetos, habilidades, spreads de SP (ranked), compañeros y builds top.
También recoge los PP reales de Champions desde la tabla de movimientos aprendibles.
Uso: python scripts/scrape_pokemon_zone.py   (tarda ~15 min; con nombres como argumentos actualiza solo esos)
"""
import html
import json
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB = ROOT / "data" / "db.json"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36"

SPECIAL = {
    "Tauros-Paldea-Combat": "tauros-paldean-form-combat-breed", "Tauros-Paldea-Blaze": "tauros-paldean-form-blaze-breed",
    "Tauros-Paldea-Aqua": "tauros-paldean-form-aqua-breed", "Basculegion-F": "basculegion-female",
    "Indeedee-F": "indeedee-female", "Floette-Eternal": "floette-eternal-flower", "Lycanroc-Dusk": "lycanroc-dusk-form",
    "Lycanroc-Midnight": "lycanroc-midnight-form", "Toxtricity-Low-Key": "toxtricity-low-key-form",
}
SKIP = {"Castform-Sunny", "Castform-Rainy", "Castform-Snowy", "Aegislash-Blade", "Gourgeist-Small",
        "Gourgeist-Large", "Gourgeist-Super", "Squawkabilly-Blue", "Squawkabilly-Yellow", "Squawkabilly-White"}


def slug(name):
    if name in SPECIAL:
        return SPECIAL[name]
    s = name.lower().replace("’", "").replace("'", "").replace(". ", "-").replace(".", "")
    s = re.sub(r"-hisui$", "-hisuian-form", s)
    s = re.sub(r"-alola$", "-alolan-form", s)
    s = re.sub(r"-galar$", "-galarian-form", s)
    s = re.sub(r"^rotom-(\w+)$", r"rotom-\1-rotom", s)
    return s


def fetch(url):
    # curl en lugar de urllib: el sitio rechaza (403) la conexión de urllib
    for wait in (0, 30, 90):
        time.sleep(wait)
        r = subprocess.run(["curl", "-sL", "-A", UA, "-w", "\n%{http_code}", url], capture_output=True, timeout=60)
        body, _, code = r.stdout.decode("utf-8", "replace").rpartition("\n")
        if code == "200":
            return body
        print(f"   HTTP {code}, reintento", flush=True)
    raise urllib.error.URLError(f"HTTP {code}")


def text_lines(page):
    t = re.sub(r"<script.*?</script>|<style.*?</style>", "", page, flags=re.S)
    t = html.unescape(re.sub(r"<[^>]+>", "\n", t))
    return [l.strip() for l in t.split("\n") if l.strip()]


def section(lines, title, stops):
    try:
        i = lines.index(title)
    except ValueError:
        return []
    out = []
    for l in lines[i + 1:]:
        if l in stops:
            break
        out.append(l)
    return out


HEADS = ["Most Common Teammates", "Most Common Moves", "Most Common Items", "Most Common Abilities",
         "Most Common Stat Points", "Learnable Moves", "Tournament Stats"]


def counts(seq):
    res = []
    for a, b in zip(seq[::2], seq[1::2]):
        m = re.match(r"([\d,]+) \(([\d.]+)%\)", b)
        if m:
            res.append({"name": a, "n": int(m.group(1).replace(",", "")), "pct": float(m.group(2))})
    return res


def parse(page):
    L = text_lines(page)
    info = {}
    m = re.search(r"([\d,]+) appearances", page)
    info["appearances"] = int(m.group(1).replace(",", "")) if m else 0
    info["moves"] = counts(section(L, "Most Common Moves", HEADS))
    info["items"] = counts(section(L, "Most Common Items", HEADS))
    info["abilities"] = counts(section(L, "Most Common Abilities", HEADS))

    # Secuencia: nombre, tipo(s), "x% usage · WR y%"; el nombre es la primera línea de cada bloque
    mates, block = [], []
    for l in section(L, "Most Common Teammates", HEADS):
        m = re.match(r"([\d.]+)% usage · WR ([\d.]+)%", l)
        if m and block:
            mates.append({"name": block[0], "pct": float(m.group(1)), "wr": float(m.group(2))})
            block = []
        elif not m:
            block.append(l)
    info["teammates"] = mates

    sp, sec = [], section(L, "Most Common Stat Points", HEADS)
    try:
        start = sec.index("Spe") + 1
        vals = sec[start:]
        for k in range(0, len(vals) - 6, 7):
            row = vals[k:k + 7]
            if not row[0].endswith("%"):
                break
            nums = [0 if x == "·" else int(x) for x in row[1:]]
            sp.append({"use": float(row[0][:-1]), "hp": nums[0], "atk": nums[1], "def": nums[2],
                       "spa": nums[3], "spd": nums[4], "spe": nums[5]})
    except (ValueError, IndexError):
        pass
    info["spreads"] = sp

    builds = []
    for k, l in enumerate(L):
        if re.fullmatch(r"#\d+", l) and k + 9 < len(L) and "WR" in L[k + 4]:
            m = re.match(r"([\d.]+)% WR · ([\d,]+) teams", L[k + 4])
            if not m:
                continue
            b = {"ability": L[k + 1], "item": L[k + 2], "wr": float(m.group(1)),
                 "teams": int(m.group(2).replace(",", "")), "moves": L[k + 5:k + 9]}
            if L[k + 9] == "Stat Alignment:":
                b["naturePct"], b["nature"] = L[k + 10], L[k + 11]
            if all(x["item"] != b["item"] or x["moves"] != b["moves"] for x in builds):
                builds.append(b)
    info["builds"] = builds[:6]

    pp, sec = {}, section(L, "Learnable Moves", ["Tournament Stats"])
    for k in range(len(sec) - 5):
        if sec[k + 2] in ("Physical", "Special", "Status") and re.fullmatch(r"\d+", sec[k + 5]):
            pp[sec[k]] = int(sec[k + 5])
    return info, pp


def main():
    db = json.loads(DB.read_text(encoding="utf-8"))
    names = [p["name"] for p in db["pokedex"] if not p["mega"] and p["name"] not in SKIP]
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    force = "--force" in sys.argv  # vuelve a descargar aunque ya estén
    if args:
        names = [n for n in names if n in args]
        force = True
    # primero los Pokémon de la box, así lo más útil llega antes
    owned = {b["name"] for b in db.get("box", [])}
    names.sort(key=lambda n: n not in owned)
    result = db.get("usage") or {"species": {}, "pp": {}}
    result["source"] = "pokemon-zone.com (Limitless, Reg M-C)"
    result["date"] = time.strftime("%Y-%m-%d")
    if not force:
        names = [n for n in names if n not in result["species"]]
    fails = []
    for i, n in enumerate(names, 1):
        url = f"https://www.pokemon-zone.com/champions/pokemon/{slug(n)}/"
        try:
            info, pp = parse(fetch(url))
            result["species"][n] = info
            result["pp"].update(pp)
            print(f"[{i}/{len(names)}] {n}: {info['appearances']} apariciones, {len(info['moves'])} movs, {len(info['builds'])} builds", flush=True)
        except (urllib.error.URLError, TimeoutError) as e:
            fails.append((n, url, str(e)))
            print(f"[{i}/{len(names)}] {n}: ERROR {e}", flush=True)
        if i % 5 == 0:
            save(db, result)
        time.sleep(5)
    save(db, result)
    print("Guardado en", DB.relative_to(ROOT), "| fallos:", fails)


def save(db, result):
    db["usage"] = result
    for m in db["moves"]:  # PP reales de Champions
        m["pp"] = result["pp"].get(m["name"], m["pp"])
    DB.write_text(json.dumps(db, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
