"""Genera data/db.json: la base de datos única del proyecto (Reg M-C).

Toma los datos de referencia de data/fuentes/ (extraídos de Pokémon Showdown y WikiDex) y
conserva lo que ya haya en db.json y sea tuyo o descargado: teams y usage.
Uso: python scripts/crear_db.py
"""
import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "fuentes"
DB = ROOT / "data" / "db.json"
sys.dont_write_bytecode = True  # sin __pycache__ en data/fuentes
sys.path.insert(0, str(SRC))
from wikidex_disponibles import TIPOS_ES, availability  # noqa: E402
from wikidex_objetos import MEGAPIEDRAS, OBJETOS  # noqa: E402

NATURES = [  # (nombre, sube, baja)
    ("Hardy", "", ""), ("Lonely", "Atk", "Def"), ("Brave", "Atk", "Spe"), ("Adamant", "Atk", "SpA"),
    ("Naughty", "Atk", "SpD"), ("Bold", "Def", "Atk"), ("Docile", "", ""), ("Relaxed", "Def", "Spe"),
    ("Impish", "Def", "SpA"), ("Lax", "Def", "SpD"), ("Timid", "Spe", "Atk"), ("Hasty", "Spe", "Def"),
    ("Serious", "", ""), ("Jolly", "Spe", "SpA"), ("Naive", "Spe", "SpD"), ("Modest", "SpA", "Atk"),
    ("Mild", "SpA", "Def"), ("Quiet", "SpA", "Spe"), ("Bashful", "", ""), ("Rash", "SpA", "SpD"),
    ("Calm", "SpD", "Atk"), ("Gentle", "SpD", "Def"), ("Sassy", "SpD", "Spe"), ("Careful", "SpD", "SpA"),
    ("Quirky", "", ""),
]

# Uso en dobles Reg M-C (Pikalytics, 14/09/2026)
USAGE_TOP = [("Rillaboom", 37.61), ("Sneasler", 36.64), ("Incineroar", 28.45), ("Salamence", 25.96),
             ("Kingambit", 24.96), ("Basculegion", 23.78), ("Golisopod", 21.68), ("Indeedee-F", 21.61),
             ("Farigiraf", 18.04), ("Garchomp", 15.44), ("Pelipper", 14.81), ("Whimsicott", 11.44),
             ("Sinistcha", 11.04), ("Gholdengo", 10.38), ("Archaludon", 10.12), ("Floette-Eternal", 10.04),
             ("Tyranitar", 8.91), ("Baxcalibur", 8.42), ("Lucario", 8.34), ("Milotic", 8.31),
             ("Charizard", 8.01), ("Sylveon", 7.80), ("Gardevoir", 7.62), ("Torkoal", 7.04),
             ("Arcanine-Hisui", 6.13)]

# Categorías de la mochila del juego (pestañas del selector de objetos)
ITEM_CATS = {
    "Stat Boost": {"White Herb", "Choice Scarf", "Scope Lens", "Wide Lens", "Zoom Lens", "Quick Claw", "Electric Seed",
                   "Grassy Seed", "Misty Seed", "Psychic Seed", "Leek", "Light Ball"},
    "Power Boost": {"Charcoal", "Mystic Water", "Miracle Seed", "Magnet", "Never-Melt Ice", "Black Belt", "Poison Barb",
                    "Soft Sand", "Sharp Beak", "Twisted Spoon", "Silver Powder", "Hard Stone", "Spell Tag", "Dragon Fang",
                    "Black Glasses", "Metal Coat", "Silk Scarf", "Fairy Feather", "Life Orb", "Expert Belt", "Muscle Band",
                    "Wise Glasses", "Metronome", "Normal Gem", "King's Rock"},
    "Defense": {"Focus Sash", "Focus Band", "Rocky Helmet", "Bright Powder", "Air Balloon"},
    "Recovery": {"Leftovers", "Shell Bell", "Big Root"},
}


def item_category(i):
    if i["megaStone"]:
        return "Mega Stones"
    if i.get("berry"):
        return "Berries"
    return next((c for c, names in ITEM_CATS.items() if i["name"] in names), "Effect")


def main():
    raw = json.loads((SRC / "data.json").read_text(encoding="utf-8"))
    tc = json.loads((SRC / "typechart.json").read_text(encoding="utf-8"))
    old = json.loads(DB.read_text(encoding="utf-8")) if DB.exists() else {}
    usage = old.get("usage") or {"source": "", "date": "", "species": {}, "pp": {}}

    avail = availability()

    def since(s):
        return avail.get(s["name"]) or avail.get(s["base"]) or avail.get(s["name"].split("-Mega")[0]) or ("", "")

    pokedex = [{
        "name": s["name"], "base": s["base"], "mega": s["mega"], "num": s["num"], "types": s["types"],
        "typesEs": [TIPOS_ES[t] for t in s["types"]], "abilities": s["abilities"], "stats": s["stats"], "bst": s["bst"],
        "megaStone": s["requiredItem"], "weight": s["weight"], "version": since(s)[0], "since": since(s)[1],
    } for s in sorted(raw["species"], key=lambda s: (s["num"], s["mega"], s["name"]))]

    items = []
    for i in raw["items"]:
        mega_from, mega_to = "", []
        if i["megaStone"]:
            mega_from, to = [x.strip() for x in i["megaFor"].split("→")]
            mega_to = [x.strip() for x in to.split(",")]
            es, ver = next((MEGAPIEDRAS[t] for t in mega_to if t in MEGAPIEDRAS), ("", "v1.2.0 (megas nuevas de Reg M-C)"))
        else:
            es, ver = OBJETOS.get(i["name"]) or ("", "")
        items.append({"name": i["name"], "nameEs": es, "category": item_category(i), "megaStone": i["megaStone"],
                      "megaFrom": mega_from, "megaTo": mega_to, "desc": i["desc"], "sprite": i.get("sprite", 0), "since": ver})

    moves = [{"name": m["name"], "type": m["type"], "category": m["cat"], "power": m["bp"], "accuracy": m["acc"],
              "pp": usage["pp"].get(m["name"], m["pp"]), "ppShowdown": m["pp"], "priority": m["prio"],
              "target": m["target"], "flags": m.get("flags", []), "desc": m["desc"]} for m in raw["moves"]]

    move_name = {m["id"]: m["name"] for m in raw["moves"]}
    learnsets = {s["name"]: sorted(move_name[x] for x in raw["learnsets"][s["id"]] if x in move_name) for s in raw["species"]}

    db = {
        "info": {
            "format": "Pokémon Champions · VGC 2026 Regulation M-C (dobles)",
            "dates": "08/09/2026 – 01/12/2026",
            "rules": ["Dobles, llevar 6 y elegir 4", "Nivel 50", "Cláusula de especie", "Cláusula de objeto",
                      "Sin míticos ni legendarios restringidos",
                      "Stat Points: 66 en total, máximo 32 por stat (IVs siempre 31)",
                      "Stat final: HP = base + 75 + SP; resto = floor((base + 20 + SP) × naturaleza)"],
            "sources": ["Pokémon Showdown (mod champions)", "Serebii / MetaVGC", "WikiDex (nombres ES y fechas)",
                        "Pikalytics (top de uso)", "pokemon-zone.com (uso por Pokémon y PP de Champions)"],
            "generated": time.strftime("%Y-%m-%d %H:%M"),
        },
        "teams": old.get("teams", []),
        "pokedex": pokedex,
        "items": items,
        "moves": moves,
        "abilities": [{"name": a["name"], "desc": a["desc"]} for a in raw["abilities"]],
        "learnsets": learnsets,
        "natures": [{"name": n, "plus": up, "minus": down} for n, up, down in NATURES],
        "typechart": tc,
        "usageTop": [{"pos": i + 1, "name": n, "use": u} for i, (n, u) in enumerate(USAGE_TOP)],
        "usage": usage,
    }
    DB.write_text(json.dumps(db, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"OK {DB.relative_to(ROOT)}: equipos={len(db['teams'])} pokedex={len(pokedex)} "
          f"objetos={len(items)} movimientos={len(moves)} uso={len(usage['species'])} especies")


if __name__ == "__main__":
    main()
