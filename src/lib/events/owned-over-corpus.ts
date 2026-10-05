import type { CompactEvent } from './event-schema.ts';

// What an organiser has no way to state, and the crawler therefore keeps
// saying: where the event was found, what else was written about it, the
// photographs sources carry, the place it is filed under, when it was first
// seen, and the editorial "gem" mark.
const fromCrawler = (event: CompactEvent): Partial<CompactEvent> => ({
  u: event.u,
  l: event.l,
  ph: event.ph,
  rg: event.rg,
  ct: event.ct,
  cr: event.cr,
  x: event.x,
});

const merged = (crawled: CompactEvent, owned: CompactEvent): CompactEvent => ({ ...crawled, ...owned, ...fromCrawler(crawled) });

/**
 * The event a page shows when it may exist twice: as the crawler found it and
 * as its organiser keeps it. The organiser has the last word on everything they
 * can state; the crawler keeps only what an organiser cannot. With one of the
 * two missing, the other is the event.
 */
export const ownedOverCorpus = (crawled: CompactEvent | undefined, owned: CompactEvent | undefined): CompactEvent | undefined =>
  [crawled]
    .flatMap((found) => [found].filter((event) => event !== undefined))
    .flatMap((found) => [owned].filter((event) => event !== undefined).map((mine) => merged(found, mine)))
    .at(0) ??
  owned ??
  crawled;
