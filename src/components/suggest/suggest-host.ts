import type { Locale } from '../../lib/i18n/locales.ts';
import type { SuggestGroups } from '../../lib/suggest/suggest-doc.ts';

/** The words the popup needs, from the page's dictionary. */
export type SuggestLabels = Readonly<{ list: string; events: string; venues: string; suggested: string }>;

/** The combobox element as its free functions see it: reactive state the
 *  template reads, and the page facts it was set up with. */
export type SuggestHost = HTMLElement & {
  groups: SuggestGroups;
  active: number;
  open: boolean;
  locale: Locale;
  labels: SuggestLabels;
};
