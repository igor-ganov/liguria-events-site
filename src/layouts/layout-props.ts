import type { Locale } from '../lib/i18n/locales.ts';

/** What a page tells the shell about itself. */
export type LayoutProps = Readonly<{
  lang: Locale;
  title: string;
  region?: string;
  city?: string | undefined;
  description?: string;
  path?: string;
  needsEvents?: boolean;
  needsMap?: boolean;
  image?: string | undefined;
  /** `article` for a single event; the shell's default `website` is right for
   *  every listing. */
  ogType?: 'website' | 'article';
  /** The locales this page is actually built in; defaults to all of them. A
   *  page that exists only at the root must say so, or its hreflang points at
   *  pages that were never built. */
  locales?: readonly Locale[];
}>;
