"""
Baja las hojas Resultados y Jugadores del Google Sheet (compartido como
"cualquiera con el vínculo puede ver") y guarda snake/data/datos.json.

El sitio lee el Sheet en vivo; este JSON es el respaldo que usa la página
cuando Google no responde (o cuando se abre sin conexión).

Uso:  python snake/scripts/actualizar_datos.py
"""
import json
import re
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

SHEET_ID = "1VgeNrhXZD44jZlBDd6pyKuE501tjJbZyH5f1-l4lukw"
RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "data" / "datos.json"


def bajar_hoja(nombre):
    url = (
        f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq"
        f"?tqx=out:json&headers=1&sheet={urllib.parse.quote(nombre)}"
    )
    with urllib.request.urlopen(url, timeout=30) as r:
        texto = r.read().decode("utf-8")
    inicio, fin = texto.index("{"), texto.rindex("}") + 1
    datos = json.loads(texto[inicio:fin])
    if datos.get("status") != "ok":
        raise RuntimeError(f"Google devolvió status={datos.get('status')} para {nombre}: {datos.get('errors')}")
    return datos["table"]


def celda(c):
    return None if c is None else c.get("v")


def fecha_iso(v):
    """'Date(2025,10,20)' (mes 0-based) -> '2025-11-20'."""
    if isinstance(v, str):
        m = re.match(r"Date\((\d+),(\d+),(\d+)", v)
        if m:
            y, mo, d = (int(x) for x in m.groups())
            return f"{y:04d}-{mo + 1:02d}-{d:02d}"
        return v[:10]
    return ""


def leer_resultados(tabla):
    cols = [c.get("label", "") for c in tabla["cols"]]
    idx = {n: cols.index(n) for n in ("Fecha", "Equipo", "Jugador", "Resultado", "Puntos", "Partido")}
    out = []
    for fila in tabla["rows"]:
        c = fila.get("c") or []
        get = lambda n: celda(c[idx[n]]) if idx[n] < len(c) else None
        fecha, jugador = get("Fecha"), get("Jugador")
        if not fecha or not jugador:
            continue
        out.append({
            "fecha": fecha_iso(fecha),
            "equipo": str(get("Equipo") or "").strip(),
            "jugador": str(jugador).strip(),
            "resultado": str(get("Resultado") or "").strip(),
            "puntos": float(get("Puntos") or 0),
            "partido": float(get("Partido") or 0),
        })
    return out


def leer_jugadores(tabla):
    out = []
    for fila in tabla["rows"]:
        c = fila.get("c") or []
        v = celda(c[0]) if c else None
        if v:
            out.append(str(v).strip())
    return out


def main():
    resultados = leer_resultados(bajar_hoja("Resultados"))
    jugadores = leer_jugadores(bajar_hoja("Jugadores"))
    datos = {
        "actualizado": datetime.now(timezone.utc).astimezone().isoformat(timespec="minutes"),
        "resultados": resultados,
        "jugadores": jugadores,
    }
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(datos, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{SALIDA}: {len(resultados)} filas de resultados, {len(jugadores)} jugadores")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:  # noqa: BLE001
        print("Error:", e, file=sys.stderr)
        sys.exit(1)
