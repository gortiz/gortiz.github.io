import type { APIContext } from 'astro';
import { atomFeed } from '../../lib/feed';

export const GET = (context: APIContext) => atomFeed(context.site!, 'es');
