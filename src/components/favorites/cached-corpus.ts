import { fetchCorpus } from './fetch-corpus.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';

const held: { events?: readonly CompactEvent[] } = {};

/** Shell: the event corpus, fetched once per page and reused by every repaint
 *  (the favourites list repaints on every `favchange`). A failed fetch caches
 *  the empty list, exactly like the single fetch it replaces. */
export const cachedCorpus = async (): Promise<readonly CompactEvent[]> => {
  held.events = held.events ?? (await fetchCorpus());
  return held.events;
};
