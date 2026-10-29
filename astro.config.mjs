// @ts-check
import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';
import sitemap from '@astrojs/sitemap';
import { rehypeHeadingIds, unified } from '@astrojs/markdown-remark';
import rehypeMermaid from 'rehype-mermaid';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeCallouts from './src/lib/rehype-callouts.mjs';

// Mermaid renders diagrams in a headless browser at build time.
// CHROME_PATH points it at a local Chrome instead of the Playwright download.
const launchOptions = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {};

export default defineConfig({
  site: 'https://gortizja.com',
  trailingSlash: 'ignore',
  integrations: [
    expressiveCode({
      themes: ['github-light', 'github-dark'],
      // Follow the site convention: prefers-color-scheme, overridden by data-theme on <html>.
      useDarkModeMediaQuery: true,
      themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
      styleOverrides: { codeFontFamily: 'ui-monospace, Menlo, monospace', codeFontSize: '0.85rem' },
    }),
    sitemap(),
  ],
  markdown: {
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid', 'math'] },
    // The remark/rehype pipeline, for the rehype plugins below (Astro's default Sätteri pipeline does not run them).
    processor: unified({
      rehypePlugins: [
        [rehypeMermaid, { strategy: 'img-svg', dark: true, launchOptions, mermaidConfig: { fontFamily: 'Helvetica Neue, Arial, sans-serif' } }],
        rehypeCallouts,
        rehypeHeadingIds,
        [rehypeAutolinkHeadings, { behavior: 'append', properties: { className: ['anchor'], ariaHidden: 'true', tabIndex: -1 }, content: { type: 'text', value: '#' } }],
      ],
    }),
  },
});
