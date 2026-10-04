import type { CompactEvent } from './event-schema.ts';

// Narrow on purpose. "test" is an ordinary word in both languages the sources
// write in — a university admission test, a cooking contest, a protest march —
// so only the shapes a smoke test actually leaves are matched: a title that
// opens with "evento test", and a venue whose name starts with "test".
const TITLE = /^\s*evento\s+test\b/iu;
const VENUE = /^\s*test\b/iu;

/**
 * The corpus without somebody's smoke tests.
 *
 * Three were live on 2026-10-04 — "Evento TEST - World Tour" at venue "TEST
 * STRUTTURA", dated 2028 and 2029, so they would never age out of the feed —
 * and one of them sat at the second-busiest venue on the site, in the week its
 * page went into the sitemap. A record like that costs more than a row: it is
 * what a reader and a crawler find at the top of a real venue's programme.
 */
export const withoutTestRecords = (events: readonly CompactEvent[]): readonly CompactEvent[] =>
  events.filter((event) => !TITLE.test(event.t) && !VENUE.test(event.v ?? ''));
