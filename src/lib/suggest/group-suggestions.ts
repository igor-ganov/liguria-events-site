import type { SuggestDoc, SuggestGroups, SuggestKind } from './suggest-doc.ts';

/** How many of each kind the popup shows: enough to choose from, few enough
 *  to read at a glance on a phone. */
const CAP: Readonly<Record<SuggestKind, number>> = { event: 5, venue: 3 };

/** One ranking split into the two groups the combobox shows, each capped and
 *  in ranking order. An id the page's file does not hold is dropped: it was
 *  answered by a newer index, and a row with nothing to say is worse than none. */
export const groupSuggestions = (docs: ReadonlyMap<string, SuggestDoc>, ranked: readonly string[]): SuggestGroups => {
  const found = ranked.flatMap((id) => [docs.get(id)].filter((doc): doc is SuggestDoc => doc !== undefined));
  const of = (kind: SuggestKind): readonly SuggestDoc[] => found.filter((doc) => doc.kind === kind).slice(0, CAP[kind]);
  return { events: of('event'), venues: of('venue') };
};
