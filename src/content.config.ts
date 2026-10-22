import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    // Drafts appear in `npm run dev` and in builds with SHOW_DRAFTS=1, never in the published site.
    draft: z.boolean().default(false),
    lang: z.enum(['en', 'es']).default('en'),
    // Posts with the same key are translations of each other.
    translationKey: z.string().optional(),
    tags: z.array(z.string()).default([]),
    // Slug of a talk in src/data/talks.ts that this post relates to.
    talk: z.string().optional(),
  }),
});

export const collections = { blog };
