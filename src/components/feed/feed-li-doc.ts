import { feedDescs } from './feed-descs.ts';
import { queryAll } from '../../lib/dom/query-all.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { SearchDoc } from '../../lib/search/index.ts';

const text = (item: HTMLElement, selector: string): string =>
  queryAll(item, selector)
    .map((node) => node.textContent ?? '')
    .join(' ');

/** The fuzzy index is built from the RENDERED cards — title, place and tag
 *  text are already in the DOM, and it covers late-published (D1) cards the
 *  moment they are inserted. What has been written about an event is not on
 *  its card: it is read from feedDescs, which is empty until the search is
 *  first touched. */
export const feedLiDoc =
  (lang: Locale) =>
  (item: HTMLElement): SearchDoc => ({
    id: item.dataset['id'] ?? '',
    lang,
    section: 'event',
    url: '',
    title: text(item, '.mini-title'),
    description: '',
    body: `${feedDescs.get(item.dataset['id'] ?? '') ?? ''} ${text(item, '.cat-tag')} ${text(item, '.photo-card-venue')}`,
  });
