#!/usr/bin/env python3
"""Update src/data/sessionize.json from the Sessionize speaker API.

    npm run sessionize                    # fetch the JSON from Sessionize
    scripts/sessionize.py speaker.json    # use a local copy

The site reads this snapshot at build time, so the build never calls Sessionize.
Run it from the repo root, review the diff, then commit.
"""
import json
import pathlib
import sys
import urllib.request

URL = "https://sessionize.com/api/speaker/json/ju18bcax5q"
OUT = pathlib.Path("src/data/sessionize.json")


def load(source):
    if source:
        return json.loads(pathlib.Path(source).read_text(encoding="utf-8"))
    with urllib.request.urlopen(URL, timeout=30) as resp:
        return json.load(resp)


def main():
    data = load(sys.argv[1] if len(sys.argv) > 1 else None)
    sessions = [
        {k: s[k] for k in ("id", "title", "description", "languageCode", "sessionUrl")}
        for s in data["sessions"]
    ]
    OUT.write_text(json.dumps({"sessions": sessions}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(sessions)} sessions to {OUT}")


if __name__ == "__main__":
    main()
