/* Vendored from @prometheus/search-core (MIT). See doc.ts for provenance. */
import type { SearchDoc, SearchIndex } from './doc.ts';
import { normalize, tokenize } from './normalize.ts';

/**
 * A document with everything the scorer needs precomputed. `tokens` is the set
 * of UNIQUE words: fuzzy matching walks it, not the raw text.
 */
export interface PreparedDoc {
  readonly doc: SearchDoc;
  readonly title: string;
  readonly description: string;
  readonly body: string;
  readonly tokens: ReadonlySet<string>;
}

/** An index with its documents prepared for scoring. */
export interface PreparedIndex {
  readonly lang: string;
  readonly docs: readonly PreparedDoc[];
}

const prepareDoc = (doc: SearchDoc): PreparedDoc => {
  const title = normalize(doc.title);
  const description = normalize(doc.description);
  const body = normalize(doc.body);
  return {
    doc,
    title,
    description,
    body,
    tokens: new Set([
      ...tokenize(title),
      ...tokenize(description),
      ...tokenize(body),
    ]),
  };
};

/**
 * Normalise an index once, so each keystroke only has to score it.
 * @param index - The index as downloaded.
 * @returns The same documents, ready to search.
 */
export const prepare = (index: SearchIndex): PreparedIndex => ({
  lang: index.lang,
  docs: index.docs.map(prepareDoc),
});
