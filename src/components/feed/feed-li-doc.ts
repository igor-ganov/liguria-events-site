import { queryAll } from '../../lib/dom/query-all.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { SearchDoc } from '../../lib/search/index.ts';

const text = (item: HTMLElement, selector: string): string =>
  queryAll(item, selector)
    .map((node) => node.textContent ?? '')
    .join(' ');

/** The fuzzy index is built from the RENDERED cards — title, description and
 *  tag text are already in the DOM, so search costs zero extra payload and
 *  covers late-published (D1) cards the moment they are inserted. */
export const feedLiDoc =
  (lang: Locale) =>
  (item: HTMLElement): SearchDoc => ({
    id: item.dataset['id'] ?? '',
    lang,
    section: 'event',
    url: '',
    title: text(item, '.mini-title'),
    description: '',
    body: `${text(item, '.mini-desc')} ${text(item, '.cat-tag')}`,
  });
