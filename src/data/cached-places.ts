import { placeIndex } from '../lib/region/place-index.ts';
import type { CompactEvent } from '../lib/events/event-schema.ts';
import type { PlaceIndex } from '../lib/region/place-index.ts';

// One fetch per build, shared like the corpus: getStaticPaths runs once per
// route and there are several routes keyed on this.
let cache: Promise<unknown> | undefined;

const load = (url: string): Promise<unknown> =>
  fetch(url, { headers: { accept: 'application/json' } })
    .then((res) => [res].filter((answer) => answer.ok).map((answer) => answer.json()).at(0))
    .catch(() => undefined);

/** The canonical places, falling back to the cities the events reveal. */
export const cachedPlaces = async (
  url: string,
  events: readonly CompactEvent[],
): Promise<PlaceIndex> => {
  cache = cache ?? load(url);
  return placeIndex(await cache, events);
};
