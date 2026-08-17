import type { Locale } from '../../lib/i18n/locales.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

/** What the feed needs to build a card in the browser: the page's language and
 *  strings, the category glyphs, and the day the static page was built for. */
export type FeedContext = {
  readonly lang: Locale;
  readonly ui: Ui;
  readonly icons: Readonly<Record<string, string>>;
  readonly today: string;
};
