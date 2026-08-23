import { slugify } from '../slugify.ts';

/** Whether a path segment is shaped like a venue slug this site mints, so that
 *  genuine nonsense still answers 404 while a real venue with nothing on does
 *  not. */
export const isVenueSlug = (slug: string): boolean =>
  slug !== '' && slug.length <= 60 && slugify(slug) === slug;
