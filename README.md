# PKM Champions DB · Dobles Reg M-C

Base de datos y teambuilder para armar un equipo competitivo de **Pokémon Champions** en dobles (VGC 2026, Regulation M-C).

## Uso

Abrí `visor.html` con doble clic. Los datos ya vienen embebidos, así que no hace falta servidor.

Pestañas:
- **Mi Box:** tus Pokémon.
- **Equipos:** el teambuilder. Replica la pantalla de entrenamiento del juego (Stat Points, naturaleza, habilidad, objeto y movimientos) y muestra el uso del meta, las debilidades y la tabla de stats. En la tabla de stats un Pokémon con su megapiedra equipada aparece en su forma base: clic en la piedra para ver la forma Mega. Los equipos se guardan en el navegador y se pueden exportar e importar en JSON.
- **Pokédex Reg M-C, Objetos, Movimientos y Meta:** tablas de consulta.

El menú está en la barra lateral izquierda (solo íconos; se despliega al pasar el mouse).

## Guardar los equipos en el sitio

Los cambios en los equipos quedan solo en el navegador (localStorage). Para que se conserven entre PCs y en el sitio publicado, el botón **Guardar en GitHub** (barra lateral o pestaña Equipos) hace un commit en `main` que actualiza `data/db.json` (sección `teams`) y el bloque de datos embebido en `visor.html`. GitHub Pages republica el sitio en uno o dos minutos.

Hace falta un token personal de GitHub, que se pide la primera vez y queda guardado solo en ese navegador (🔑 en la barra lateral para cambiarlo u olvidarlo):
1. github.com → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.
2. Repository access: solo este repo.
3. Permissions → Contents: Read and write.

Al abrir el visor, los equipos del navegador se fusionan con los de `db.json`: gana la versión más reciente de cada equipo y un equipo borrado desde otra PC desaparece. El punto rojo sobre 💾 avisa que hay cambios sin subir.

## Fondos

Las imágenes de `fondos/` van rotando en cada pantalla y la paleta de colores se adapta al color dominante del fondo en uso. En modo claro solo se usan las imágenes claras. Si agregás o cambiás fondos, corré `python scripts/paleta_fondos.py` para recalcular los colores.

## Datos

Todo está en `data/db.json`:
- box y equipos
- Pokédex (349 formas legales), objetos (166), movimientos (510), habilidades y learnsets
- naturalezas, tabla de tipos y uso del meta

| Script | Qué hace |
|---|---|
| `python scripts/crear_db.py` | Regenera los datos de referencia desde `data/fuentes/` (conserva box, equipos y uso) |
| `python scripts/scrape_pokemon_zone.py` | Actualiza el uso por Pokémon y los PP de Champions (`--force` para bajar todo de nuevo) |
| `python scripts/actualizar_visor.py` | Embebe `db.json` en `visor.html` |
| `python scripts/paleta_fondos.py` | Calcula el color dominante de cada imagen de `fondos/` y lo embebe en `visor.html` |

Fuentes: Pokémon Showdown (mod `champions`), Serebii, MetaVGC, WikiDex (nombres en español y fechas), Pikalytics y pokemon-zone.com.
