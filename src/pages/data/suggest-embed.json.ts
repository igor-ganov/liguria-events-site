import { cachedEvents } from '../../data/cached-events.ts';
import { EVENTS_URL } from '../../data/events-url.ts';
import { embedDocs } from '../../lib/suggest/embed-docs.ts';
import { isoToday } from '../../lib/calendar/iso-today.ts';
import type { APIRoute } from 'astro';

// The texts scripts/build-suggest-index.ts embeds after the build, from the
// same corpus the pages were built from. The script removes this file from
// dist once it has read it: the worker only needs the ids and the vectors.
export const prerender = true;

export const GET: APIRoute = async () => {
  const { events } = await cachedEvents(EVENTS_URL);
  return Response.json(embedDocs(events, isoToday()));
};
