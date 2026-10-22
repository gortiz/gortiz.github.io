import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;
export type Lang = Post['data']['lang'];

const SHOW_DRAFTS = import.meta.env.DEV || process.env.SHOW_DRAFTS === '1';

/** Published posts (plus drafts in dev), newest first. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => SHOW_DRAFTS || !data.draft);
  checkTranslations(posts);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Every post exists in English. A post in another language is a translation of an English post. */
function checkTranslations(posts: Post[]) {
  for (const post of posts) {
    if (post.data.lang === 'en') continue;
    const key = post.data.translationKey;
    if (!key || !posts.some((p) => p.data.lang === 'en' && p.data.translationKey === key)) {
      throw new Error(`Post "${post.id}" (${post.data.lang}) needs an English post with translationKey "${key ?? ''}".`);
    }
  }
}

export function postUrl(post: Post): string {
  return `/blog/${post.id}/`;
}

/** Other-language versions of a post, matched by translationKey. */
export function translationsOf(post: Post, posts: Post[]): Post[] {
  const key = post.data.translationKey;
  if (!key) return [];
  return posts.filter((p) => p.id !== post.id && p.data.translationKey === key);
}

/** The English posts: the lists show these, and each one links to its translations. */
export function primaryPosts(posts: Post[]): Post[] {
  return posts.filter((post) => post.data.lang === 'en');
}

export const languageNames: Record<Lang, string> = { en: 'English', es: 'Español' };

export function readingMinutes(post: Post): number {
  const words = (post.body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** The few strings a post page shows, in the language of the post. */
export const strings = {
  en: { minRead: 'min read', contents: 'Contents', updated: 'Updated', readIn: 'Read in English', relatedTalk: 'Related talk', draft: 'Draft' },
  es: { minRead: 'min de lectura', contents: 'Índice', updated: 'Actualizado', readIn: 'Leer en español', relatedTalk: 'Charla relacionada', draft: 'Borrador' },
} satisfies Record<Lang, Record<string, string>>;

const locales: Record<Lang, string> = { en: 'en-GB', es: 'es-ES' };

export function formatDate(date: Date, lang: Lang = 'en'): string {
  return date.toLocaleDateString(locales[lang], { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}
