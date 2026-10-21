#!/usr/bin/env python3
"""Fill the talk pages from the Sessionize speaker JSON.

    tools/sessionize.py                # fetch the JSON from Sessionize
    tools/sessionize.py speaker.json   # use a local copy

The script rewrites only the marked blocks:
- <!-- sessionize:abstract ID --> ... <!-- /sessionize:abstract -->: the abstract of session ID,
  inside a hand-written entry (index.html, talks/index.html).
- <!-- sessionize:start --> ... <!-- sessionize:end -->: the "More talks" list in talks/index.html,
  one entry per session not in SKIP.
Run it from the repo root, review the diff, then commit.
"""
import html
import json
import pathlib
import re
import sys
import urllib.request

URL = "https://sessionize.com/api/speaker/json/ju18bcax5q"
PAGES = [pathlib.Path("index.html"), pathlib.Path("talks/index.html")]
START, END = "<!-- sessionize:start -->", "<!-- sessionize:end -->"
ABSTRACT = re.compile(r"<!-- sessionize:abstract (\d+) -->.*?<!-- /sessionize:abstract -->", re.S)

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


def render_abstract(session):
    paragraphs = [p.strip() for p in session["description"].replace("\r\n", "\n").split("\n\n") if p.strip()]
    body = "\n".join(f"        <p>{html.escape(p)}</p>" for p in paragraphs)
    return f"""<details>
        <summary>Abstract</summary>
{body}
      </details>"""


def render_item(session):
    return f"""    <li>
      <div class="title">{html.escape(session["title"])}</div>
      {render_abstract(session)}
      <div class="links"><a href="{html.escape(session["sessionUrl"])}">Sessionize</a></div>
    </li>"""


def fill_abstracts(page, sessions):
    def replace(match):
        sid = int(match.group(1))
        return f"<!-- sessionize:abstract {sid} -->\n      {render_abstract(sessions[sid])}\n      <!-- /sessionize:abstract -->"
    return ABSTRACT.subn(replace, page)


def fill_list(page, sessions):
    if START not in page:
        return page, 0
    items = [render_item(s) for s in sessions.values() if s["id"] not in SKIP]
    block = "\n".join([START, '  <ul class="talks">', *items, "  </ul>", f"  {END}"])
    head, rest = page.split(START, 1)
    _, tail = rest.split(END, 1)
    return head + block + tail, len(items)


def main():
    data = load(sys.argv[1] if len(sys.argv) > 1 else None)
    sessions = {s["id"]: s for s in data["sessions"]}
    for path in PAGES:
        page = path.read_text(encoding="utf-8")
        page, n_abstracts = fill_abstracts(page, sessions)
        page, n_items = fill_list(page, sessions)
        path.write_text(page, encoding="utf-8")
        print(f"{path}: {n_abstracts} abstracts, {n_items} list entries")


if __name__ == "__main__":
    main()
