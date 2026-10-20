import { browserLocale } from '../../lib/i18n/browser-locale.ts';
import { localizeLinks } from './localize-links.ts';
import { queryAll } from '../../lib/dom/query-all.ts';
import { readRegion } from '../../lib/region/read-region.ts';
import { regionUrl } from '../../lib/region/region-url.ts';
import { storedRegion } from '../../lib/region/stored-region.ts';
import { stripLocale } from '../../lib/i18n/strip-locale.ts';
import { wireRegionHere } from '../region/wire-region-here.ts';
import type { Locale } from '../../lib/i18n/locales.ts';

/**
 * Honour what the reader already decided, and let them say where they are.
 *
 * The door decides nothing. It used to be a 302 built at the edge from an IP
 * lookup, which is why neither of the reader's own answers could win: both live
 * in the browser, and the browser was never asked. Here they are read.
 *
 * The jump keeps the door the reader came through — the feed, the calendar, the
 * map — and goes in their own language, so a reader whose browser states
 * Italian is not sent to the English feed by a page that happens to be written
 * in English.
 */
const resume = (locale: Locale): void =>
  [storedRegion(readRegion())]
    .filter((slug): slug is string => slug !== undefined)
    .map((slug) => regionUrl(locale, slug, stripLocale(window.location.pathname)))
    // replace, not assign: the door is not a step in the reader's history, so
    // Back goes where they came from rather than here.
    .forEach((to) => window.location.replace(`${to}${window.location.search}`));

const wire = (root: HTMLElement): void => {
  const locale = browserLocale([...navigator.languages]);
  resume(locale);
  // Every link on the door, not only the list: a reader whose browser states
  // Italian should not be handed an English event card either.
  localizeLinks(root, locale);
  queryAll(root, '[data-region-list]')
    .slice(0, 1)
    .forEach((list) => wireRegionHere(root, list));
};

/** Wire the front door, now and after a client-side navigation back to it. */
export const initEntry = (): void => {
  const bind = (): void => queryAll(document, '[data-entry]').forEach(wire);
  bind();
  document.addEventListener('astro:page-load', bind);
};
