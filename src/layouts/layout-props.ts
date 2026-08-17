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
}>;
