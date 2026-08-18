import { branch } from '../branch.ts';
import type { CompactEvent } from './event-schema.ts';

// The map asks the programme WHEN, never what it is called — the popup card
// shows the umbrella. Shipping the dates alone keeps a container's programme
// close to free.
const programmeDates = (event: CompactEvent): Readonly<Record<string, unknown>> =>
  branch(event.p === undefined)(
    () => ({}),
    () => ({ p: (event.p ?? []).map((session) => ({ date: session.date })) }),
  );

/**
 * The only fields the MAP reads: coordinates and category for the pin, the date
 * window and flags for the filters, and title / image / when for the popup card.
 * An allowlist rather than a denylist, so a new detail-page field cannot start
 * shipping to the map by accident.
 *
 * It must keep everything EventSchema requires (id, t, s, c, u), because the
 * client re-validates the file with decodeEventList — that decode, plus the
 * marker assertions in e2e/map-layers.spec.ts, is what guards this list.
 */
const DRAWN: ReadonlySet<string> = new Set([
  'id', 't', 'tl', 's', 'e', 'h', 'v', 'c', 'g', 'u', 'img', 'f', 'x', 'ct', 'rg',
  // The date filter is only correct for a container when it can see the
  // programme: without `k` and `p` the map would keep pinning a festival to
  // every day of its advertised run while the feed no longer does.
  'k', 'p',
]);

/**
 * Reduce an event to what the map draws. The descriptions alone are 62% of the
 * corpus — three languages of full structured articles, none of which appears on
 * the map — so dropping them and the other detail-only fields takes the file
 * from 2.98 MB to 634 KB (144 KB over the wire).
 */
export const mapEventFields = (event: CompactEvent): Readonly<Record<string, unknown>> => ({
  ...Object.fromEntries(Object.entries(event).filter(([key]) => DRAWN.has(key))),
  ...programmeDates(event),
});
