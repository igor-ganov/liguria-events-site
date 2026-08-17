import { fieldOf } from './field-of.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { decodeEventList } from '../../lib/events/decode-event-list.ts';
import { EVENTS_URL } from '../../data/events-url.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';

// The feed is served either bare or wrapped as { events: [...] }.
const list = (json: unknown): unknown => [fieldOf(json, 'events')].filter(isDefined).at(0) ?? json;

/** Shell: load the event corpus a saved route's ids are resolved against. An
 *  unreachable or malformed feed yields no events rather than a broken page. */
export const fetchCorpus = async (): Promise<readonly CompactEvent[]> => {
  try {
    const json: unknown = await (await fetch(EVENTS_URL)).json();
    return decodeEventList(list(json));
  } catch {
    return [];
  }
};
