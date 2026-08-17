import { resized } from './resized.ts';

/** Absolute URL of a cover image, for OG tags and JSON-LD — a crawler cannot do
 *  anything with the site-relative form. Nothing to build without a cover. */
export const absoluteImage = (img?: string, site?: URL): string | undefined =>
  [img].filter((src) => src !== undefined).map((src) => new URL(resized(src, 1024), site).toString())[0];
