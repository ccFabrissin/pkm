"""Pokémon disponibles en Pokémon Champions según WikiDex (pegado por el usuario, 14/09/2026).

Solo se listan las especies agregadas en 1.1.0 y 1.2.0; el resto de la lista es de 1.0.2.
Contenido de wikidex.net (atribución a sus autores).
"""

V102 = ("v1.0.2", "2026-04-08")
V110 = ("v1.1.0", "2026-06-17")
V120 = ("v1.2.0", "2026-09-09")

ALL = """Venusaur,Charizard,Blastoise,Beedrill,Pidgeot,Arbok,Pikachu,Raichu,Raichu-Alola,Clefable,Ninetales,Ninetales-Alola,
Wigglytuff,Vileplume,Persian,Persian-Alola,Arcanine,Arcanine-Hisui,Alakazam,Machamp,Victreebel,Slowbro,Slowbro-Galar,
Farfetch’d,Gengar,Kangaskhan,Starmie,Mr. Mime,Pinsir,Tauros,Tauros-Paldea-Combat,Tauros-Paldea-Blaze,Tauros-Paldea-Aqua,
Gyarados,Ditto,Vaporeon,Jolteon,Flareon,Aerodactyl,Snorlax,Dragonite,Meganium,Typhlosion,Typhlosion-Hisui,Feraligatr,
Ariados,Ampharos,Azumarill,Politoed,Espeon,Umbreon,Slowking,Slowking-Galar,Forretress,Steelix,Qwilfish,Scizor,Heracross,
Skarmory,Houndoom,Tyranitar,Sceptile,Blaziken,Swampert,Pelipper,Gardevoir,Sableye,Mawile,Aggron,Medicham,Manectric,
Swalot,Sharpedo,Camerupt,Torkoal,Altaria,Milotic,Castform,Banette,Chimecho,Absol,Glalie,Salamence,Metagross,Torterra,
Infernape,Empoleon,Staraptor,Luxray,Roserade,Rampardos,Bastiodon,Lopunny,Spiritomb,Garchomp,Lucario,Hippowdon,Toxicroak,
Abomasnow,Weavile,Rhyperior,Leafeon,Glaceon,Gliscor,Mamoswine,Gallade,Froslass,Rotom,Rotom-Heat,Rotom-Wash,Rotom-Frost,
Rotom-Fan,Rotom-Mow,Serperior,Emboar,Samurott,Samurott-Hisui,Watchog,Liepard,Simisage,Simisear,Simipour,Musharna,
Excadrill,Audino,Conkeldurr,Scolipede,Whimsicott,Krookodile,Scrafty,Cofagrigus,Garbodor,Zoroark,Zoroark-Hisui,Reuniclus,
Vanilluxe,Emolga,Eelektross,Chandelure,Beartic,Stunfisk,Stunfisk-Galar,Golurk,Hydreigon,Volcarona,Chesnaught,Delphox,
Greninja,Diggersby,Talonflame,Vivillon,Pyroar,Floette-Eternal,Florges,Gogoat,Pangoro,Furfrou,Meowstic,Aegislash,
Aromatisse,Slurpuff,Malamar,Barbaracle,Dragalge,Clawitzer,Heliolisk,Tyrantrum,Aurorus,Sylveon,Hawlucha,Dedenne,Goodra,
Goodra-Hisui,Klefki,Trevenant,Gourgeist,Avalugg,Avalugg-Hisui,Noivern,Decidueye,Decidueye-Hisui,Incineroar,Primarina,
Toucannon,Crabominable,Lycanroc,Lycanroc-Midnight,Lycanroc-Dusk,Toxapex,Mudsdale,Araquanid,Salazzle,Tsareena,Oranguru,
Passimian,Golisopod,Mimikyu,Drampa,Kommo-o,Rillaboom,Cinderace,Inteleon,Corviknight,Thievul,Flapple,Appletun,Sandaconda,
Toxtricity,Toxtricity-Low-Key,Grapploct,Polteageist,Hatterene,Grimmsnarl,Perrserker,Sirfetch’d,Mr. Rime,Runerigus,
Alcremie,Falinks,Pincurchin,Indeedee,Indeedee-F,Morpeko,Dragapult,Wyrdeer,Kleavor,Basculegion,Basculegion-F,Sneasler,
Overqwil,Meowscarada,Skeledirge,Quaquaval,Pawmot,Maushold,Arboliva,Squawkabilly,Garganacl,Armarouge,Ceruledge,Bellibolt,
Mabosstiff,Scovillain,Espathra,Tinkaton,Palafin,Orthworm,Glimmora,Houndstone,Annihilape,Farigiraf,Kingambit,Baxcalibur,
Gholdengo,Sinistcha,Archaludon,Hydrapple"""

ADDED_110 = """Vileplume,Qwilfish,Sceptile,Blaziken,Swampert,Mawile,Metagross,Staraptor,Musharna,Scolipede,Scrafty,Eelektross,
Pyroar,Malamar,Barbaracle,Dragalge,Grimmsnarl,Falinks,Overqwil,Houndstone,Annihilape,Gholdengo"""

ADDED_120 = """Wigglytuff,Persian,Persian-Alola,Farfetch’d,Mr. Mime,Swalot,Salamence,Gogoat,Golisopod,Rillaboom,Cinderace,
Inteleon,Thievul,Toxtricity,Toxtricity-Low-Key,Grapploct,Perrserker,Sirfetch’d,Pincurchin,Indeedee,Indeedee-F,Pawmot,
Arboliva,Squawkabilly,Mabosstiff,Baxcalibur"""


def _split(s):
    return [x.strip() for x in s.replace("\n", "").split(",") if x.strip()]


def availability():
    a110, a120 = set(_split(ADDED_110)), set(_split(ADDED_120))
    return {n: (V120 if n in a120 else V110 if n in a110 else V102) for n in _split(ALL)}


# Tipos en español
TIPOS_ES = {"Normal": "Normal", "Fire": "Fuego", "Water": "Agua", "Electric": "Eléctrico", "Grass": "Planta",
            "Ice": "Hielo", "Fighting": "Lucha", "Poison": "Veneno", "Ground": "Tierra", "Flying": "Volador",
            "Psychic": "Psíquico", "Bug": "Bicho", "Rock": "Roca", "Ghost": "Fantasma", "Dragon": "Dragón",
            "Dark": "Siniestro", "Steel": "Acero", "Fairy": "Hada"}
