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
  /** A page that exists for whoever holds its URL and for nobody else. Links
   *  get forwarded into inboxes that are indexed; this is what stops a leak
   *  becoming a search result. */
  noindex?: boolean;
  /** The locales this page is actually built in; defaults to all of them. A
   *  page that exists only at the root must say so, or its hreflang points at
   *  pages that were never built. */
  locales?: readonly Locale[];
  /** Whether the header carries the region picker. The front door is itself a
   *  region picker, and the header's would otherwise label it with the founding
   *  region — the page that exists to stop guessing, guessing in its own
   *  header. */
  picker?: boolean;
}>;
