import { prepare, search } from '../../lib/search/index.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { SearchDoc } from '../../lib/search/index.ts';
import type { SuggestDoc } from '../../lib/suggest/suggest-doc.ts';

/** A region's suggestion file, ready: every target by id, and the letters
 *  matched on the device — which is what works with no network at all. */
export type SuggestSource = Readonly<{ docs: ReadonlyMap<string, SuggestDoc>; lexical: (query: string) => readonly string[] }>;

const FIELDS = ['id', 'kind', 'title', 'sub', 'path', 'body', 'until'];

const isDocs = (value: unknown): value is readonly SuggestDoc[] =>
  Array.isArray(value) && value.every((doc) => FIELDS.every((key) => typeof Reflect.get(Object(doc), key) === 'string'));

const searchDoc = (lang: Locale) => (doc: SuggestDoc): SearchDoc => ({ id: doc.id, lang, section: 'event', url: doc.path, title: doc.title, description: doc.sub, body: doc.body });

const ready = (lang: Locale, today: string) => (all: readonly SuggestDoc[]): SuggestSource => {
  // The file can be days old in the service worker's cache: what is over by
  // now is not suggested.
  const docs = all.filter((doc) => doc.until === '' || doc.until >= today);
  const index = prepare({ lang, docs: docs.map(searchDoc(lang)) });
  return { docs: new Map(docs.map((doc) => [doc.id, doc])), lexical: (query) => search(index, query, 16).map((hit) => hit.doc.id) };
};

// One fetch per file for the life of the page; a failed one is asked again.
const asked = new Map<string, Promise<SuggestSource>>();

/** The suggestion source for a region, in a language. Fetched when the box is
 *  first used, kept by the service worker (/data/ is stale-while-revalidate),
 *  and empty — not broken — when it cannot be had. */
export const suggestSource = (region: string, lang: Locale, today: string): Promise<SuggestSource> => {
  const url = `/data/suggest/${region}.${lang}.json`;
  const pending =
    asked.get(url) ??
    fetch(url, { headers: { accept: 'application/json' } })
      .then((answer) => answer.json())
      .then((value: unknown) => [value].filter(isDocs).at(0) ?? [])
      .catch(() => {
        asked.delete(url);
        return [];
      })
      .then(ready(lang, today));
  asked.set(url, pending);
  return pending;
};
