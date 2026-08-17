import { cachedEvents } from '../../data/cached-events.ts';
import { EVENTS_URL } from '../../data/events-url.ts';
import { mapEventFields } from '../../lib/events/map-event-fields.ts';
import type { APIRoute } from 'astro';

// The corpus projected to the fields the map draws — see mapEventFields. Emitted
// once at build time and fetched after first paint, so the map page's HTML stays
// tiny and this file is cached for every later visit. Inlining the FULL corpus
// into the HTML cost ~13 s of a throttled connection before anything rendered;
// shipping the full corpus even as a file still saturated the pipe, because 62%
// of it is trilingual descriptions the map never shows.
export const prerender = true;

export const GET: APIRoute = async () => {
  const payload = await cachedEvents(EVENTS_URL);
  return Response.json(payload.events.map(mapEventFields));
};
