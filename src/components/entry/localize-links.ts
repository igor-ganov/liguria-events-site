import { localizedUrl } from '../../lib/i18n/localized-url.ts';
import { queryAll } from '../../lib/dom/query-all.ts';
import { stripLocale } from '../../lib/i18n/strip-locale.ts';
import type { Locale } from '../../lib/i18n/locales.ts';

const isAnchor = (node: unknown): node is HTMLAnchorElement => node instanceof HTMLAnchorElement;

/**
 * Say every link on the door in the reader's own language.
 *
 * The door is a prerendered page, so it is written in one language and the
 * assets layer answers it before any middleware could negotiate another. The
 * links are what matters: a reader whose browser states Italian should not
 * click "Lombardia" and land on the English feed. Rewritten in place, before
 * anything is clicked, and left alone when the page is already in their
 * language.
 */
export const localizeLinks = (root: HTMLElement, locale: Locale): void =>
  queryAll(root, 'a')
    .filter(isAnchor)
    .forEach((link) => {
      link.href = localizedUrl(locale, stripLocale(new URL(link.href).pathname));
    });
