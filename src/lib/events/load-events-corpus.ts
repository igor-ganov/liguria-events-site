import { decodeEventList } from './decode-event-list.ts';
import type { CompactEvent } from './event-schema.ts';

const base = (import.meta.env?.BASE_URL ?? '').replace(/\/$/, '');

/**
 * Fetch the events the map draws — the build-time snapshot emitted by
 * src/pages/data/map-events.json.ts, already reduced to the fields a pin and its
 * popup need. Deliberately NOT inlined into the page: it downloads after first
 * paint and is then cached for every later visit. A failed or malformed response
 * yields an empty list rather than throwing, so the map still opens (without
 * event markers) if the asset is missing.
 */
export const loadEventsCorpus = async (): Promise<readonly CompactEvent[]> => {
  const parsed = await fetch(`${base}/data/map-events.json`, { headers: { accept: 'application/json' } })
    .then((res) => res.json())
    .catch(() => undefined);
  return decodeEventList(parsed);
};
