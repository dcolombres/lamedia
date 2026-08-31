"""Genera reglamento.pdf a partir de reglamento.md."""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MD_PATH = ROOT / "reglamento.md"
CSS_PATH = Path(__file__).resolve().parent / "reglamento-print.css"
HTML_PATH = ROOT / "reglamento-print.html"
PDF_PATH = ROOT / "Yo Soy El Rey - Reglamento.pdf"
CHROME = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")


def require_markdown():
    try:
        import markdown  # noqa: F401
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "markdown", "-q"])


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text, flags=re.UNICODE)
    text = re.sub(r"[\s_]+", "-", text).strip("-")
    return text


def convert_markdown(source: str) -> str:
    import markdown

    return markdown.markdown(
        source,
        extensions=["tables", "sane_lists", "smarty"],
        output_format="html5",
    )


def postprocess(html: str) -> str:
    html = re.sub(
        r"<p><strong>Consejo\.</strong>",
        r'<p class="tip"><strong>Consejo.</strong>',
        html,
    )
    html = re.sub(
        r"<p><strong>Ganás vos\.</strong>",
        r'<p class="result"><strong>Ganás vos.</strong>',
        html,
    )
    html = re.sub(
        r"<p><strong>Gana ([^<]+)</strong>",
        r'<p class="result"><strong>Gana \1</strong>',
        html,
    )
    html = re.sub(
        r"<p><strong>(K &gt; Q &gt; J[^<]+)</strong></p>",
        r'<p class="rank-line">\1</p>',
        html,
    )
    html = html.replace(
        '<h2>Índice</h2>',
        '<h2 id="índice">Índice</h2>',
    )
    html = html.replace(
        '<h2>Ejemplos</h2>',
        '<h2 id="ejemplos">Ejemplos</h2>',
    )
    html = re.sub(
        r"<h3>([A-Z]\d? — [^<]+)</h3>",
        r'<h3 class="example-title">\1</h3>',
        html,
    )
    html = html.replace("<hr>", "")
    return html


def wrap_html(body: str) -> str:
    css = CSS_PATH.read_text(encoding="utf-8")
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Yo Soy El Rey — Reglamento</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
{css}
    </style>
</head>
<body>
    <header class="cover">
        <p class="cover-mark" aria-hidden="true">♛</p>
        <p class="cover-title">Yo Soy El Rey</p>
        <p class="subtitle">Reglamento</p>
        <p class="lead">Reglas, ejemplos y cómo pensar cada jugada. Para 2 a 6 jugadores. En la mesa digital podés jugar solo o con varios.</p>
        <p class="idea">No es una carta por cabeza. La mano sigue hasta que alguien <strong>pasa</strong> o <strong>descarta</strong>. Quien iba ganando se la queda. Cada carta que tirás es una que no vas a poder declarar después.</p>
        <p class="cover-meta">Primero en 40 · K♥ abre · la media · el pozo</p>
    </header>
    <main class="page">
{body}
    </main>
</body>
</html>
"""


def strip_cover_from_body(html: str) -> str:
    html = re.sub(r"<h1>[^<]+</h1>\s*", "", html, count=1)
    html = re.sub(
        r"<p>Reglamento completo:.*?</p>\s*",
        "",
        html,
        count=1,
        flags=re.S,
    )
    html = re.sub(
        r"<p>La idea de fondo:.*?</p>\s*",
        "",
        html,
        count=1,
        flags=re.S,
    )
    html = re.sub(
        r"<p>Versión resumida para leer en el repo:.*?</p>\s*",
        '<p class="colophon">Este reglamento reúne las reglas, los ejemplos y los consejos de la mesa digital Yo Soy El Rey.</p>',
        html,
        count=1,
        flags=re.S,
    )
    return html


def print_pdf():
    if not CHROME.exists():
        raise SystemExit(f"No se encontró Chrome en {CHROME}")
    cmd = [
        str(CHROME),
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        "--virtual-time-budget=12000",
        f"--print-to-pdf={PDF_PATH}",
        HTML_PATH.resolve().as_uri() + f"?v={PDF_PATH.stat().st_mtime_ns if PDF_PATH.exists() else 0}",
    ]
    subprocess.check_call(cmd)


def main():
    require_markdown()
    source = MD_PATH.read_text(encoding="utf-8")
    body = strip_cover_from_body(postprocess(convert_markdown(source)))
    HTML_PATH.write_text(wrap_html(body), encoding="utf-8")
    print_pdf()
    print(f"Listo: {PDF_PATH} ({PDF_PATH.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
