import { isDefined } from '../is-defined.ts';
import { ownedOverCorpus } from './owned-over-corpus.ts';
import type { CompactEvent } from './event-schema.ts';

/**
 * The events organisers have taken over, as the feed should show them: the
 * organiser's version laid over the crawler's (see ownedOverCorpus), each
 * marked so a page that already carries the crawler's card knows to replace
 * it. One the crawler has since lost is sent as the organiser keeps it.
 */
export const keptByOrganisers = (corpus: readonly CompactEvent[], owned: readonly CompactEvent[]): readonly CompactEvent[] =>
  owned
    .map((mine) => ownedOverCorpus(corpus.find((found) => found.id === mine.id), mine))
    .filter(isDefined)
    .map((event) => ({ ...event, ow: true }));
