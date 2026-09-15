"""Objetos equipables en Pokémon Champions según WikiDex (pegado por el usuario, 14/09/2026).

Nombre en inglés (Showdown) -> (nombre en español, versión). Megapiedras indexadas por la forma mega.
Contenido de wikidex.net (atribución a sus autores).
"""

A, J = "v1.0.2", "v1.1.0"

OBJETOS = {
    "Cheri Berry": ("Baya Zreza", A), "Chesto Berry": ("Baya Atania", A), "Pecha Berry": ("Baya Meloc", A),
    "Rawst Berry": ("Baya Safre", A), "Aspear Berry": ("Baya Perasi", A), "Leppa Berry": ("Baya Zanama", A),
    "Oran Berry": ("Baya Aranja", A), "Persim Berry": ("Baya Caquic", A), "Lum Berry": ("Baya Ziuela", A),
    "Sitrus Berry": ("Baya Zidra", A), "Occa Berry": ("Baya Caoca", A), "Passho Berry": ("Baya Pasio", A),
    "Wacan Berry": ("Baya Gualot", A), "Rindo Berry": ("Baya Tamar", A), "Yache Berry": ("Baya Rimoya", A),
    "Chople Berry": ("Baya Pomaro", A), "Kebia Berry": ("Baya Kebia", A), "Shuca Berry": ("Baya Acardo", A),
    "Coba Berry": ("Baya Kouba", A), "Payapa Berry": ("Baya Payapa", A), "Tanga Berry": ("Baya Yecana", A),
    "Charti Berry": ("Baya Alcho", A), "Kasib Berry": ("Baya Drasi", A), "Haban Berry": ("Baya Anjiro", A),
    "Colbur Berry": ("Baya Dillo", A), "Babiri Berry": ("Baya Baribá", A), "Chilan Berry": ("Baya Chilan", A),
    "Roseli Berry": ("Baya Hibis", A),
    "Bright Powder": ("Polvo Brillo", A), "White Herb": ("Hierba Blanca", A), "Quick Claw": ("Garra Rápida", A),
    "Mental Herb": ("Hierba Mental", A), "King's Rock": ("Roca del Rey", A), "Silver Powder": ("Polvo Plata", A),
    "Focus Band": ("Cinta Aguante", A), "Scope Lens": ("Periscopio", A), "Metal Coat": ("Revestimiento Metálico", A),
    "Leftovers": ("Restos", A), "Light Ball": ("Bola Luminosa", A), "Soft Sand": ("Arena Fina", A),
    "Hard Stone": ("Piedra Dura", A), "Miracle Seed": ("Semilla Milagro", A), "Black Glasses": ("Gafas de Sol", A),
    "Black Belt": ("Cinturón Negro", A), "Magnet": ("Imán", A), "Mystic Water": ("Agua Mística", A),
    "Sharp Beak": ("Pico Afilado", A), "Poison Barb": ("Flecha Venenosa", A), "Never-Melt Ice": ("Hielo Perpetuo", A),
    "Spell Tag": ("Hechizo", A), "Twisted Spoon": ("Cuchara Torcida", A), "Charcoal": ("Carbón", A),
    "Dragon Fang": ("Colmillo de Dragón", A), "Silk Scarf": ("Pañuelo de Seda", A), "Shell Bell": ("Cascabel Concha", A),
    "Fairy Feather": ("Pluma Feérica", A), "Focus Sash": ("Banda Aguante", A), "Choice Scarf": ("Pañuelo Elección", A),
    "Wide Lens": ("Lupa", J), "Muscle Band": ("Cinta Fuerte", J), "Wise Glasses": ("Gafas Especiales", J),
    "Expert Belt": ("Cinturón de Experto", J), "Light Clay": ("Refleluz", J), "Life Orb": ("Vidasfera", J),
    "Zoom Lens": ("Telescopio", J), "Metronome": ("Metrónomo", J), "Iron Ball": ("Bola Férrea", J),
    "Icy Rock": ("Roca Helada", J), "Smooth Rock": ("Roca Suave", J), "Heat Rock": ("Roca Calor", J),
    "Damp Rock": ("Roca Lluvia", J), "Shed Shell": ("Muda Concha", J), "Big Root": ("Raíz Grande", J),
}

MEGAPIEDRAS = {  # forma mega -> (nombre ES, versión)
    "Gengar-Mega": ("Gengarita", A), "Gardevoir-Mega": ("Gardevoirita", A), "Ampharos-Mega": ("Ampharosita", A),
    "Venusaur-Mega": ("Venusaurita", A), "Charizard-Mega-X": ("Charizardita X", A), "Charizard-Mega-Y": ("Charizardita Y", A),
    "Blastoise-Mega": ("Blastoisita", A), "Blaziken-Mega": ("Blazikenita", J), "Medicham-Mega": ("Medichamita", A),
    "Houndoom-Mega": ("Houndoomita", A), "Aggron-Mega": ("Aggronita", A), "Banette-Mega": ("Banettita", A),
    "Tyranitar-Mega": ("Tyranitarita", A), "Scizor-Mega": ("Scizorita", A), "Pinsir-Mega": ("Pinsirita", A),
    "Aerodactyl-Mega": ("Aerodactylita", A), "Lucario-Mega": ("Lucarita", A), "Abomasnow-Mega": ("Abomasnowita", A),
    "Kangaskhan-Mega": ("Kangaskhanita", A), "Gyarados-Mega": ("Gyaradosita", A), "Absol-Mega": ("Absolita", A),
    "Alakazam-Mega": ("Alakazamita", A), "Heracross-Mega": ("Heracrossita", A), "Mawile-Mega": ("Mawilita", J),
    "Manectric-Mega": ("Manectricita", A), "Garchomp-Mega": ("Garchompita", A), "Swampert-Mega": ("Swampertita", J),
    "Sceptile-Mega": ("Sceptilita", J), "Sableye-Mega": ("Sableynita", A), "Altaria-Mega": ("Altarianita", A),
    "Gallade-Mega": ("Galladita", A), "Audino-Mega": ("Audinita", A), "Metagross-Mega": ("Metagrossita", J),
    "Sharpedo-Mega": ("Sharpedonita", A), "Slowbro-Mega": ("Slowbronita", A), "Steelix-Mega": ("Steelixita", A),
    "Pidgeot-Mega": ("Pidgeotita", A), "Glalie-Mega": ("Glalita", A), "Camerupt-Mega": ("Cameruptita", A),
    "Lopunny-Mega": ("Lopunnita", A), "Beedrill-Mega": ("Beedrillita", A), "Clefable-Mega": ("Clefablita", A),
    "Victreebel-Mega": ("Victreebelita", A), "Starmie-Mega": ("Starmita", A), "Dragonite-Mega": ("Dragonitita", A),
    "Meganium-Mega": ("Meganiumita", A), "Feraligatr-Mega": ("Feraligatrita", A), "Skarmory-Mega": ("Skarmorita", A),
    "Froslass-Mega": ("Froslassita", A), "Emboar-Mega": ("Emboarita", A), "Excadrill-Mega": ("Excadrillita", A),
    "Scolipede-Mega": ("Scolipedita", J), "Scrafty-Mega": ("Scraftita", J), "Eelektross-Mega": ("Eelektrossita", J),
    "Chandelure-Mega": ("Chandelurita", A), "Chesnaught-Mega": ("Chesnaughtita", A), "Delphox-Mega": ("Delphoxita", A),
    "Greninja-Mega": ("Greninjanita", A), "Pyroar-Mega": ("Pyroarita", J), "Floette-Mega": ("Floettita", A),
    "Malamar-Mega": ("Malamarita", J), "Barbaracle-Mega": ("Barbaraclita", J), "Dragalge-Mega": ("Dragalgita", J),
    "Hawlucha-Mega": ("Hawluchanita", A), "Drampa-Mega": ("Drampanita", A), "Falinks-Mega": ("Falinksita", J),
    "Raichu-Mega-X": ("Raichunita X", J), "Raichu-Mega-Y": ("Raichunita Y", J), "Chimecho-Mega": ("Chimechita", A),
    "Staraptor-Mega": ("Staraptorita", J), "Golurk-Mega": ("Golurkita", A), "Meowstic-M-Mega": ("Meowsticita", A),
    "Meowstic-F-Mega": ("Meowsticita", A), "Crabominable-Mega": ("Crabominablita", A),
    "Scovillain-Mega": ("Scovillainita", A), "Glimmora-Mega": ("Glimmoranita", A),
}
