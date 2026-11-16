import { regionOf } from '../../region/region-of.ts';
import { stableHash } from './stable-hash.ts';
import type { CompactEvent } from '../event-schema.ts';

type Candidate = Readonly<{ picture: string; rank: number }>;

const pictureOf = (event: CompactEvent): string => event.th ?? event.img ?? '';

const own = (here: CompactEvent): ReadonlySet<string> => new Set([here.img, here.th].filter((url): url is string => url !== undefined));

// The town first, then the rest of the region; within each, an order that
// looks shuffled but is the same for this event on every build.
const candidate =
  (here: CompactEvent) =>
  (event: CompactEvent): Candidate => ({
    picture: pictureOf(event),
    rank: Number((event.ct ?? '') !== (here.ct ?? '')) * 2 ** 32 + stableHash(`${here.id}:${event.id}`),
  });

/**
 * Photographs of OTHER events in the same region, for the tiles of an event
 * page to wear as a toned collage: never the event's own picture, the
 * thumbnail where the corpus carries one, each picture once.
 */
export const collagePool = (all: readonly CompactEvent[], here: CompactEvent, count: number): readonly string[] => {
  const mine = own(here);
  const pictures = all
    .filter((event) => event.id !== here.id && regionOf(event) === regionOf(here) && event.img !== undefined)
    .filter((event) => !mine.has(event.img ?? '') && !mine.has(pictureOf(event)))
    .map(candidate(here))
    .toSorted((one, other) => one.rank - other.rank)
    .map((one) => one.picture);
  return [...new Set(pictures)].slice(0, count);
};
