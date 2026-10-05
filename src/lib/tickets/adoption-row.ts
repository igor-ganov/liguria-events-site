import type { CompactEvent } from '../events/event-schema.ts';

/** A crawled event as the row it is stored as once it has an organiser. */
export type AdoptionRow = Readonly<{
  id: string;
  submitterId: string;
  status: 'published';
  visibility: 'public';
  titleEn: string;
  titleIt: string;
  titleRu: string;
  descEn: string;
  descIt: string;
  descRu: string;
  startDate: string;
  endDate: string | undefined;
  categories: string;
  venue: string | undefined;
  address: string | undefined;
  cover: string | undefined;
  lat: number | undefined;
  lng: number | undefined;
  free: number;
  sessions: string | undefined;
  kind: string | undefined;
  now: string;
}>;

const programme = (event: CompactEvent): string | undefined =>
  [event.p ?? []].filter((sessions) => sessions.length > 0).map((sessions) => JSON.stringify(sessions)).at(0);

/**
 * Everything the crawler knows about an event, as the row an organiser will
 * edit. Published and public from the start, because that is what the event
 * already was: handing it over must not take it down for a review.
 */
export const adoptionRow = (event: CompactEvent, ownerId: string, now: string): AdoptionRow => ({
  id: event.id,
  submitterId: ownerId,
  status: 'published',
  visibility: 'public',
  titleEn: event.tl?.en ?? event.t,
  titleIt: event.tl?.it ?? event.t,
  titleRu: event.tl?.ru ?? event.t,
  descEn: event.d?.en ?? '',
  descIt: event.d?.it ?? '',
  descRu: event.d?.ru ?? '',
  startDate: event.s,
  endDate: event.e,
  categories: JSON.stringify(event.c),
  venue: event.v,
  address: event.a,
  cover: event.img,
  lat: event.g?.[0],
  lng: event.g?.[1],
  free: Number(event.f === true),
  sessions: programme(event),
  kind: ['container'].filter(() => event.k === true).at(0),
  now,
});
