"""Embebe data/db.json dentro de visor.html (así el visor abre con doble clic, sin servidor)."""
import datetime
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB = ROOT / "data" / "db.json"
HTML = ROOT / "visor.html"


def main():
    stamp = datetime.datetime.fromtimestamp(DB.stat().st_mtime).strftime("%d/%m/%Y %H:%M")
    payload = json.dumps(json.loads(DB.read_text(encoding="utf-8")), ensure_ascii=False, separators=(",", ":"))
    payload = payload.replace("</", "<\\/")
    block = (f'<!--DATA-START--><script id="db" type="application/json" data-source="db.json ({stamp})">'
             f'{payload}</script><!--DATA-END-->')
    html = HTML.read_text(encoding="utf-8")
    html = re.sub(r"<!--USAGE-START-->.*?<!--USAGE-END-->\n?", "", html, flags=re.S)
    html = re.sub(r"<!--DATA-START-->.*?<!--DATA-END-->", lambda _: block, html, flags=re.S)
    HTML.write_text(html, encoding="utf-8")
    print(f"visor.html actualizado con db.json ({stamp})")


if __name__ == "__main__":
    main()
