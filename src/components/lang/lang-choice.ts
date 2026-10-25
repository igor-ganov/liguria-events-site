import { isLocale } from '../../lib/i18n/is-locale.ts';
import type { Locale } from '../../lib/i18n/locales.ts';

const KEY = 'lang-choice';

/**
 * The language this tab is being read in. Kept per tab, like the history it
 * steers: another tab, or tomorrow's visit, starts from the page it opens.
 * Storage that will not answer (a private window, blocked site data) leaves
 * the history in the languages it was walked in, which is how it used to be.
 */
export const langChoice = {
  read: (): Locale | undefined => {
    try {
      return [sessionStorage.getItem(KEY)].filter(isLocale).at(0);
    } catch {
      return undefined;
    }
  },
  keep: (lang: string): void => {
    try {
      [lang].filter(isLocale).forEach((chosen) => sessionStorage.setItem(KEY, chosen));
    } catch {
      // Nothing to keep it in; see above.
    }
  },
};
