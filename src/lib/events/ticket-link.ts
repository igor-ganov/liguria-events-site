import type { CompactEvent } from './event-schema.ts';

// Ticketing platforms whose presence among an event's links means "you buy the
// ticket here". Matched against the URL host only, so a path segment can't
// masquerade as a vendor.
const TICKET_HOSTS: readonly string[] = [
  'ticketmaster',
  'ticketone',
  'vivaticket',
  'mailticket',
  'ticketsms',
  'dice.fm',
  'eventbrite',
  'boxol',
  'diyticket',
  'liveticket',
  'ciaotickets',
  'happyticket',
  'oooh.events',
  'xceed',
];

const hostOf = (url: string): string =>
  (url.replace(/^https?:\/\/(www\.)?/i, '').split('/')[0] ?? '').toLowerCase();

const isTicketUrl = (url: string): boolean =>
  TICKET_HOSTS.some((host) => hostOf(url).includes(host));

/** The event's ticket-vendor URL, if any source is a known ticketing platform. */
export const ticketUrl = (event: CompactEvent): string | undefined =>
  [event.u, ...(event.l ?? []).map((link) => link.url)].find(isTicketUrl);
