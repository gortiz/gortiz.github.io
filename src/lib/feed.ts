import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE, AUTHOR } from '../consts';
import { getPosts, postUrl, type Lang, type Post } from './posts';

/** One feed per language: English posts at the root, translations under /<lang>/. */
export const feeds: Record<Lang, { title: string; description: string; rss: string; atom: string }> = {
  en: { title: SITE_TITLE, description: SITE_DESCRIPTION, rss: '/rss.xml', atom: '/atom.xml' },
  es: { title: `${SITE_TITLE} (Español)`, description: 'Traducciones al español de los posts de Gonzalo Ortiz.', rss: '/es/rss.xml', atom: '/es/atom.xml' },
};

interface FeedItem {
  post: Post;
  url: string;
  html: string;
}

/** Feed readers need absolute URLs, and the heading anchors are noise outside the page. */
function forFeed(html: string, site: URL, url: string): string {
  return html
    .replace(/<a class="anchor"[^>]*>#<\/a>/g, '')
    .replace(/(href|src)="\/(?!\/)/g, `$1="${site.origin}/`)
    .replace(/href="#/g, `href="${url}#`);
}

async function feedItems(site: URL, lang: Lang): Promise<FeedItem[]> {
  const posts = (await getPosts()).filter((post) => post.data.lang === lang);
  return posts.map((post) => {
    const url = new URL(postUrl(post), site).href;
    return { post, url, html: forFeed(post.rendered?.html ?? '', site, url) };
  });
}

export async function rssFeed(site: URL, lang: Lang): Promise<Response> {
  const feed = feeds[lang];
  const items = await feedItems(site, lang);
  return rss({
    title: feed.title,
    description: feed.description,
    site,
    items: items.map(({ post, url, html }) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: url,
      content: html,
      categories: post.data.tags,
    })),
    customData: `<language>${lang}</language><atom:link href="${new URL(feed.rss, site).href}" rel="self" type="application/rss+xml"/>`,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
  });
}

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function atomFeed(site: URL, lang: Lang): Promise<Response> {
  const feed = feeds[lang];
  const items = await feedItems(site, lang);
  const self = new URL(feed.atom, site).href;
  const updated = items
    .map(({ post }) => post.data.updatedDate ?? post.data.pubDate)
    .reduce((a, b) => (b > a ? b : a), new Date(0));
  const entries = items.map(({ post, url, html }) => `  <entry>
    <title>${escape(post.data.title)}</title>
    <link href="${url}"/>
    <id>${url}</id>
    <published>${post.data.pubDate.toISOString()}</published>
    <updated>${(post.data.updatedDate ?? post.data.pubDate).toISOString()}</updated>
    <summary>${escape(post.data.description)}</summary>
${post.data.tags.map((t) => `    <category term="${escape(t)}"/>`).join('\n')}
    <content type="html">${escape(html)}</content>
  </entry>`);
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${lang}">
  <title>${escape(feed.title)}</title>
  <subtitle>${escape(feed.description)}</subtitle>
  <link href="${site.origin}/"/>
  <link href="${self}" rel="self" type="application/atom+xml"/>
  <id>${self}</id>
  <updated>${updated.toISOString()}</updated>
  <author><name>${escape(AUTHOR)}</name></author>
${entries.join('\n')}
</feed>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' } });
}
