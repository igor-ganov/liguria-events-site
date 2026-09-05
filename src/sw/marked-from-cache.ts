import { FROM_CACHE_ATTRIBUTE } from './from-cache-attribute.ts';

const OPENING_TAG = /<html\b/i;

/**
 * The same document with a note on it saying it came out of storage, and when.
 *
 * Written into the markup rather than sent as a header because a page cannot
 * read the headers of its own navigation response, and asking the worker
 * afterwards would be a second way for this to be wrong. The page reads the
 * attribute synchronously, before it paints, and shows the bar with no round
 * trip and no race.
 *
 * Anything that is not a document is handed back untouched: half a rewrite is
 * worse than none.
 */
export const markedFromCache = (html: string, storedMs: number): string =>
  // exec answers with the platform's empty value; `?? undefined` turns it into
  // the one this codebase deals in before anything reads it.
  [OPENING_TAG.exec(html) ?? undefined]
    .filter((match) => match !== undefined)
    .map((match) => match.index + match[0].length)
    .map((at) => `${html.slice(0, at)} ${FROM_CACHE_ATTRIBUTE}="${storedMs}"${html.slice(at)}`)
    .at(0) ?? html;
