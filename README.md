# gortizja.com

Source of https://gortizja.com: a blog and the slides of my talks. Astro builds the site into static files. A GitHub Actions workflow publishes them to GitHub Pages on each push to `master`.

## Layout

| Path | Content |
|---|---|
| `src/content/blog/*.md` | Blog posts. The file name is the URL: `foo.md` is served at `/blog/foo/`. |
| `src/data/talks.ts` | Talks with slides: title, events, links, and the Sessionize session ID. |
| `src/data/sessionize.json` | Snapshot of the Sessionize sessions. The build reads it for the abstracts. |
| `src/pages/` | Home, blog, talks, and the feeds: `/rss.xml` and `/atom.xml` for the English posts, `/es/rss.xml` and `/es/atom.xml` for the Spanish translations. |
| `public/` | Files that the build copies as they are: slide decks in `talks/<slug>/`, `privacy/`, `404.html`, `CNAME`, `style.css`. |
| `scripts/sessionize.py` | Updates `src/data/sessionize.json` from the Sessionize API. |

## Run the site locally

```sh
npm install
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run dev
```

The dev server shows drafts. `CHROME_PATH` lets Mermaid use the local Chrome. Without it, install the Playwright browser once with `npx playwright install chromium`.

To build the published site, run `npm run build`. The output goes to `dist/`. To include drafts in a build, set `SHOW_DRAFTS=1`.

## Write a post

1. Create `src/content/blog/<slug>.md`.
2. Start the file with this frontmatter:

   ```yaml
   ---
   title: From JNI to Panama in one function
   description: One sentence for the post list, the feeds and link previews.
   pubDate: 2026-10-22
   draft: true            # remove it to publish
   lang: en               # en or es
   translationKey: jni-to-panama   # optional, the same key on each translation
   tags: [java, rust]
   talk: panama-rust      # optional, a slug from src/data/talks.ts
   ---
   ```

3. Write the post in Markdown.
4. Run `npm run dev` and open http://localhost:4321/blog/.
5. When the post is ready, remove `draft: true`, commit and push.

Optional fields: `updatedDate`, `translationKey`, `talk`.

### Code blocks

Expressive Code renders the code blocks. These are the most useful options:

````md
```java title="PanamaAdd.java" {2-4}
...
```

```diff lang="java"
-old line
+new line
```
````

`title` adds a file tab. `{2-4}` marks lines 2 to 4. `diff lang="java"` shows a diff with Java syntax colors. The full syntax is at https://expressive-code.com/key-features/text-markers/.

### Mermaid diagrams

Write a `mermaid` code block. The build converts each diagram to SVG, with a light and a dark version. The page loads no JavaScript for the diagrams, and the diagrams are also visible in the feeds.

### Translations

Every post has an English version. Some posts also have a Spanish translation.

1. Write the English post with a `translationKey`.
2. Write the translation in a separate file, with `lang: es` and the same `translationKey`.

Each version links to the other. The post lists show only the English posts, with a link to the translation. The English feeds contain the English posts. The Spanish feeds contain the translations. If a Spanish post has no English post with the same `translationKey`, the build fails.

## Update the talks

- To add a talk with slides, copy the deck into `public/talks/<slug>/` and add an entry to `src/data/talks.ts`.
- To update the abstracts, run `npm run sessionize` and commit `src/data/sessionize.json`.

The "More talks" list shows each Sessionize session that `src/data/talks.ts` does not link.
