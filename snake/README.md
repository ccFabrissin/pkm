# Serpiente app · Fútbol de los Jueves

Estadísticas del fútbol de los jueves y armado de equipos con el método de la serpiente. Publicada en https://cayetano.click/snake/.

Es una página estática (`index.html`) que lee en vivo el Google Sheet del grupo, compartido como "cualquiera con el vínculo puede ver", por el endpoint `gviz` de Google (devuelve JSON con CORS, no hace falta Apps Script ni backend). Si Google no responde, usa el respaldo `data/datos.json` y lo avisa en el pie de página.

## Vistas

- **Tabla:** posiciones por puntaje promedio, separadas en habituales (más de 5 partidos) y esporádicos. Las dos tablas son las caras de una tarjeta que gira con el switch Habituales / Esporádicos (la elección queda guardada en el navegador). Click en una columna para reordenar. El borde de la tabla se ilumina del lado por donde se acerca el mouse.
- **Próximo partido:** elegís 10 o 12 jugadores (5v5 / 6v6) y arma los equipos con la serpiente: ordena por puntaje efectivo y reparte Blanco / Negro / Negro / Blanco / Blanco… Los jugadores con 5 partidos o menos se ponderan con el promedio del resto; se pueden tipear jugadores nuevos. La selección queda guardada en el navegador.
- **Historial:** todos los partidos, con equipos y resultado.
- **Jugadores:** ficha de cada uno (rachas, compañeros, rivales).
- **Rachas:** quién tuvo alguna vez el fuego (4 o más victorias seguidas) o el hielo (4 o más derrotas seguidas), el mismo umbral que los badges de la tabla. Un slicer elige Hielo o Fuego; click en un jugador despliega cada racha con cuántos partidos duró y de qué fecha a qué fecha. Cada modo tiene su fondo de video (campamento invernal / hero cinematográfico) y la elección queda guardada en el navegador; también se puede entrar directo por `#/rachas/hielo` o `#/rachas/fuego`.
- **Cruces:** con quién ganás y perdés más.
- **Evolución:** cómo subió y bajó cada jugador en la tabla partido a partido, con reproducción animada.

## Datos

El Sheet tiene dos hojas que la página lee tal cual:

| Hoja | Columnas |
|---|---|
| `Resultados` | `Fecha`, `Equipo` (A/B), `Jugador`, `Resultado` (G/E/P), `Puntos`, `Partido` |
| `Jugadores` | una columna con el encabezado `Jugadores` y un nombre por fila |

Cada fila de `Resultados` es un jugador en un partido. Para cargar una fecha nueva alcanza con agregar las filas al Sheet: la página las toma en la próxima carga. Los nombres tienen que coincidir exactamente entre filas (y con la hoja `Jugadores`) para que cuenten como la misma persona.

Para refrescar el respaldo embebido en el sitio:

```bash
python snake/scripts/actualizar_datos.py
```

Baja las dos hojas y reescribe `data/datos.json` con la fecha de actualización. Conviene correrlo cada tanto y commitearlo, así el respaldo no queda viejo.

## Efectos visuales

Vienen de componentes de [React Bits](https://reactbits.dev) portados a JS plano, sin React ni dependencias, con la paleta de la página (teal `#1EC3C3`, violeta `#A78BFA`, verde `#10B981`):

- **Aurora** (fondo): shader WebGL2 en un canvas fijo; se ajusta en `AURORA_OPTS` dentro de `index.html`. Sin WebGL2 vuelven las partículas 2D de antes.
- **BorderGlow** (tablas de posiciones): borde de malla de colores y luz exterior que siguen al puntero. Es solo CSS más un `pointermove` que setea `--edge-proximity` y `--cursor-angle`.
- **FlipCard** (tablas de posiciones): giro 3D con transición CSS, sin la librería `motion`. Gira solo con el switch.

Los tres respetan `prefers-reduced-motion`.

## Origen

Portada desde el proyecto de Google Apps Script "Fútbol de los Jueves" (`Code.gs`, `Index.html`, `Stylesheet.html`, `JavaScript.html`). El HTML, el CSS y el JS son los mismos, unidos en un solo archivo; lo único que cambió es la carga de datos, que antes pasaba por `google.script.run.getData()` y ahora es un `fetch` al Sheet.
