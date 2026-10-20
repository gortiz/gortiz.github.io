#!/usr/bin/env python3
"""Regenerate the "More talks" list in talks/index.html from the Sessionize speaker JSON.

    tools/sessionize.py                # fetch the JSON from Sessionize
    tools/sessionize.py speaker.json   # use a local copy

The script rewrites only the block between the sessionize:start and sessionize:end markers.
Run it from the repo root, review the diff, then commit.
"""
import html
import json
import pathlib
import sys
import urllib.request

URL = "https://sessionize.com/api/speaker/json/ju18bcax5q"
PAGE = pathlib.Path("talks/index.html")
START, END = "<!-- sessionize:start -->", "<!-- sessionize:end -->"

# Sessions that already have a hand-written entry with slides.
SKIP = {
    155839,  # Native Speed, Java Comfort
    155840,  # Rust en la JVM gracias a Panama (Spanish version of 155839)
    191859,  # Your Iceberg Table Is Already a Pinot Table
}


def load(source):
    if source:
        return json.loads(pathlib.Path(source).read_text(encoding="utf-8"))
    with urllib.request.urlopen(URL, timeout=30) as resp:
        return json.load(resp)


def render(session):
    paragraphs = [p.strip() for p in session["description"].replace("\r\n", "\n").split("\n\n") if p.strip()]
    abstract = "\n".join(f"        <p>{html.escape(p)}</p>" for p in paragraphs)
    return f"""    <li>
      <div class="title">{html.escape(session["title"])}</div>
      <details>
        <summary>Abstract</summary>
{abstract}
      </details>
      <div class="links"><a href="{html.escape(session["sessionUrl"])}">Sessionize</a></div>
    </li>"""


def main():
    data = load(sys.argv[1] if len(sys.argv) > 1 else None)
    items = [render(s) for s in data["sessions"] if s["id"] not in SKIP]
    block = "\n".join([START, '  <ul class="talks">', *items, "  </ul>", f"  {END}"])
    page = PAGE.read_text(encoding="utf-8")
    head, rest = page.split(START, 1)
    _, tail = rest.split(END, 1)
    PAGE.write_text(head + block + tail, encoding="utf-8")
    print(f"Wrote {len(items)} sessions to {PAGE}")


if __name__ == "__main__":
    main()
