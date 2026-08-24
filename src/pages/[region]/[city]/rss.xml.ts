import { cachedEvents } from '../../../data/cached-events.ts';
import { cachedPlaces } from '../../../data/cached-places.ts';
import { cityName } from '../../../lib/region/city-name.ts';
import { eventRssItems } from '../../../lib/seo/event-rss-items.ts';
import { EVENTS_URL } from '../../../data/events-url.ts';
import { feedEvents } from '../../../lib/events/feed-events.ts';
import { isoToday } from '../../../lib/calendar/iso-today.ts';
import { PLACES_URL } from '../../../data/places-url.ts';
import { rssXml } from '../../../lib/seo/rss-xml.ts';
import type { APIRoute } from 'astro';

// A feed per city, not only per region: a reader in Genoa does not want
// Liguria, and the bots other people run subscribe to one place at a time.
export const prerender = true;

export const getStaticPaths = async () => {
  const payload = await cachedEvents(EVENTS_URL);
  const places = await cachedPlaces(PLACES_URL, payload.events);
  return Object.entries(places).flatMap(([region, cities]) =>
    cities.map((city) => ({ params: { region, city }, props: { region, city } })),
  );
};

export const GET: APIRoute = async ({ props, site }) => {
  const region = String(props['region'] ?? '');
  const city = String(props['city'] ?? '');
  const payload = await cachedEvents(EVENTS_URL);
  const items = eventRssItems(feedEvents(payload.events, { region, city }), isoToday(), site);
  const name = cityName(city);
  return new Response(
    rssXml(
      {
        title: `${name} — Dove Go`,
        link: new URL(`/${region}/${city}/`, site).toString(),
        self: new URL(`/${region}/${city}/rss.xml`, site).toString(),
        description: `Upcoming events in ${name}.`,
      },
      items,
    ),
    { headers: { 'content-type': 'application/rss+xml; charset=utf-8' } },
  );
};
