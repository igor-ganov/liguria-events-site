import type { AlternateLink } from './alternate-links.ts';

/** One sitemap entry: a page, when it last changed, and its other languages. */
export type SitemapUrl = Readonly<{
  loc: string;
  lastmod: string;
  alternates: readonly AlternateLink[];
}>;
