import { branch } from '../branch.ts';
import type { CompactEvent } from './event-schema.ts';

type Params = Readonly<{
  event: CompactEvent;
  title: string;
  desc: string;
  image: string | undefined;
  address: string | undefined;
}>;

type Json = Record<string, unknown>;

/** Drop undefined / empty-string members so optional fields are simply absent. */
const clean = (obj: Json): Json =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined && value !== ''));

const OFFER: Json = {
  '@type': 'Offer',
  price: '0',
  priceCurrency: 'EUR',
  availability: 'https://schema.org/InStock',
};

/** schema.org Event JSON-LD; `<` is escaped so the string is safe in a
 *  `<script type="application/ld+json">` body. */
export const eventJsonLd = (params: Params): string => {
  const { event, title, desc, image, address } = params;
  const place = clean({ '@type': 'Place', name: event.v, address });
  const hasPlace = event.v !== undefined || (address !== undefined && address !== '');
  const graph = clean({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: title,
    startDate: event.s,
    endDate: event.e ?? event.s,
    image,
    description: desc,
    location: branch(hasPlace)(() => place, () => undefined),
    offers: branch(event.f === true)(() => OFFER, () => undefined),
  });
  return JSON.stringify(graph).replace(/</g, '\\u003c');
};
