import { cachedEvents } from '../../data/cached-events.ts';
import { cardFonts } from '../../lib/og/card-fonts.ts';
import { EVENTS_URL } from '../../data/events-url.ts';
import { eventCard } from '../../lib/og/event-card.ts';
import { ogCardSvg } from '../../lib/og/og-card-svg.ts';
import { renderCard } from '../../lib/og/render-card.ts';
import { resolveEvent } from '../../lib/events/resolve-event.ts';
import type { APIRoute } from 'astro';

// The picture a chat app shows when somebody pastes an event link. Rendered
// here because an event made ten minutes ago cannot have been drawn at build
// time, and Cloudflare's image transformations refuse to rasterise SVG:
// "Conversion between SVG and raster formats is not supported".
export const prerender = false;

// A day: the card only changes when the event does, and an event that has been
// shared is about to be fetched by every chat app the link reaches.
const CACHE = 'public, max-age=86400, stale-while-revalidate=604800';

export const GET: APIRoute = async ({ params, locals }) => {
  const corpus = await cachedEvents(EVENTS_URL);
  const { event } = await resolveEvent({
    id: params['id'] ?? '',
    corpus: corpus.events,
    db: locals.runtime.env.DB,
    userId: undefined,
    eventsUrl: EVENTS_URL,
  });
  switch (event) {
    case undefined:
      return new Response('', { status: 404 });
  }
  const png = await renderCard(ogCardSvg(eventCard(event)), cardFonts());
  return new Response(png, {
    headers: { 'content-type': 'image/png', 'cache-control': CACHE },
  });
};
