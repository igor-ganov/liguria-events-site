/** A suggestion request, read off the URL. */
export type SuggestQuery = Readonly<{ text: string; region: string }>;

// Under three letters a query says too little to mean anything, and every
// request spends from the daily Workers AI allowance. Over eighty it is a
// paste, not a search.
const MIN = 3;
const MAX = 80;
const REGION = /^[a-z][a-z-]{1,40}$/;

/** The query and region, normalised so one cache entry answers every way of
 *  typing the same words — or nothing, when either is not worth an answer. */
export const suggestQuery = (url: URL): SuggestQuery | undefined => {
  const text = (url.searchParams.get('q') ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  const region = url.searchParams.get('rg') ?? '';
  return [{ text, region }].filter((query) => query.text.length >= MIN && query.text.length <= MAX && REGION.test(query.region)).at(0);
};
