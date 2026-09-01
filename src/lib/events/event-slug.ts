import { slugify } from '../slugify.ts';

/** The parts of an event its address is built from. Narrower than CompactEvent
 *  so a route stop or a freshly inserted row can ask for one too. */
export type EventAddress = Readonly<{
  id: string;
  t: string;
  s: string;
  v?: string | undefined;
}>;

const TITLE = 56;
const HOST = 28;

const capped = (value: string, max: number): string =>
  slugify(value).slice(0, max).replace(/-+$/, '');

/**
 * An event's address, in the words people would use for it: the name, who is
 * putting it on, the day, and the id.
 *
 * The id is last and always present. It is the thing that makes two identical
 * evenings distinguishable, but it is also the only key the collector's archive
 * has: an event that has already happened is fetched by id and by nothing else,
 * and those are exactly the URLs that stay in a search index longest. Drop the
 * id and every shared link dies the day after the event — which this site has
 * already paid for once, 15 806 URLs' worth.
 *
 * Built from the base title, never a translated one: one event, one address,
 * with the language carried by the path prefix.
 */
export const eventSlug = (event: EventAddress): string =>
  [
    capped(event.t, TITLE),
    ...[event.v ?? ''].filter((venue) => venue !== '').map((venue) => capped(venue, HOST)),
    capped(event.s, 10),
    event.id,
  ]
    .filter((part) => part !== '')
    .join('-');
