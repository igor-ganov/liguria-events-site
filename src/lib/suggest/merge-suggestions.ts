import { fuseRanks } from './fuse-ranks.ts';
import { groupSuggestions } from './group-suggestions.ts';
import type { SemanticIds, SuggestDoc, SuggestGroups } from './suggest-doc.ts';

/**
 * The letters typed and the meaning, as one grouped answer. Each group is
 * fused on its own, so a venue's rank is not pushed down by how many events
 * the meaning found. Without the meaning — offline, the endpoint down, a query
 * too short to send — the letters alone decide, so the box never goes quiet
 * because the network did.
 */
export const mergeSuggestions = (
  docs: ReadonlyMap<string, SuggestDoc>,
  lexical: readonly string[],
  semantic: SemanticIds | undefined,
): SuggestGroups => ({
  events: groupSuggestions(docs, fuseRanks([lexical, semantic?.events ?? []])).events,
  venues: groupSuggestions(docs, fuseRanks([lexical, semantic?.venues ?? []])).venues,
});
