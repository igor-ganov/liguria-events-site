import { branch } from '../branch.ts';
import { ticketUrl } from './ticket-link.ts';
import type { CompactEvent } from './event-schema.ts';

type Json = Record<string, unknown>;

// Where to send someone who wants in: the vendor's own page when a known
// ticketing platform is among the sources, and our page otherwise.
const buyAt = (event: CompactEvent, pageUrl: string): string => ticketUrl(event) ?? pageUrl;

const freeOffer = (event: CompactEvent, pageUrl: string): Json => ({
  '@type': 'Offer',
  price: '0',
  priceCurrency: 'EUR',
  availability: 'https://schema.org/InStock',
  url: buyAt(event, pageUrl),
});

// A paid event whose price we never captured still needs an offer, or it drops
// out of the search results as "no ticket information". Naming the vendor
// without inventing a number is the truthful half we can state.
const paidOffer = (event: CompactEvent, pageUrl: string): Json => ({
  '@type': 'Offer',
  availability: 'https://schema.org/InStock',
  url: buyAt(event, pageUrl),
});

/** The ticket offer: free when the source said so, otherwise where to buy. */
export const eventOffersLd = (event: CompactEvent, pageUrl: string): Json =>
  branch(event.f === true)(
    () => freeOffer(event, pageUrl),
    () => paidOffer(event, pageUrl),
  );
