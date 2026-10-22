import type { APIContext } from 'astro';
import { rssFeed } from '../../lib/feed';

export const GET = (context: APIContext) => rssFeed(context.site!, 'es');
