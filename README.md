# PKM Champions DB · Dobles Reg M-C

Base de datos y teambuilder para armar un equipo competitivo de **Pokémon Champions** en dobles (VGC 2026, Regulation M-C).

## Uso

Abrí `visor.html` con doble clic. Los datos ya vienen embebidos, así que no hace falta servidor.

Pestañas:
- **Equipos:** el teambuilder. Replica la pantalla de entrenamiento del juego (Stat Points, naturaleza, habilidad, objeto y movimientos) y muestra el uso del meta, las debilidades y la tabla de stats. En la tabla de stats un Pokémon con su megapiedra equipada aparece en su forma base: clic en la piedra para ver la forma Mega. Los equipos se guardan en el navegador y se pueden exportar e importar en JSON.
- **Pokédex Reg M-C, Objetos, Movimientos y Meta:** tablas de consulta.

El menú está en la barra lateral izquierda (solo íconos; se despliega al pasar el mouse).

## Equipos: guardar, compartir y llevar a otra PC

Los equipos se guardan solos en el navegador (localStorage) con cada cambio. Eso no viaja a otra PC ni sobrevive a borrar los datos del navegador, así que para conservarlos o moverlos:
- **Exportar** descarga un JSON con todos los equipos. **Importar** lee ese JSON y agrega los equipos que contiene (no reemplaza los que ya hay).
- **Copiar texto** copia al portapapeles el equipo actual en formato de texto (especie, objeto, habilidad, naturaleza, SP y movimientos), pensado para pegarlo en Discord o en notas. Es solo lectura: no se puede importar.
- Los equipos de `data/db.json` (sección `teams`) vienen embebidos en el visor y se fusionan con los del navegador al abrir: gana la versión más reciente de cada equipo. Para dejar un equipo fijo en el sitio, pegá el JSON exportado en esa sección y corré `python scripts/actualizar_visor.py`.

## Fondos

Las imágenes de `fondos/` van rotando en cada pantalla y la paleta de colores se adapta al color dominante del fondo en uso. En modo claro solo se usan las imágenes claras. Si agregás o cambiás fondos, corré `python scripts/paleta_fondos.py` para recalcular los colores.

## Datos

Todo está en `data/db.json`:
- equipos
- Pokédex (349 formas legales), objetos (166), movimientos (510), habilidades y learnsets
- naturalezas, tabla de tipos y uso del meta

| Script | Qué hace |
|---|---|
| `python scripts/crear_db.py` | Regenera los datos de referencia desde `data/fuentes/` (conserva equipos y uso) |
| `python scripts/scrape_pokemon_zone.py` | Actualiza el uso por Pokémon y los PP de Champions (`--force` para bajar todo de nuevo) |
| `python scripts/actualizar_visor.py` | Embebe `db.json` en `visor.html` |
| `python scripts/paleta_fondos.py` | Calcula el color dominante de cada imagen de `fondos/` y lo embebe en `visor.html` |

Fuentes: Pokémon Showdown (mod `champions`), Serebii, MetaVGC, WikiDex (nombres en español y fechas), Pikalytics y pokemon-zone.com.
