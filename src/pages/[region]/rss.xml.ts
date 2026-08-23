import { cachedEvents } from '../../data/cached-events.ts';
import { EVENTS_URL } from '../../data/events-url.ts';
import { eventRssItems } from '../../lib/seo/event-rss-items.ts';
import { eventsOfRegion } from '../../lib/region/events-of-region.ts';
import { isoToday } from '../../lib/calendar/iso-today.ts';
import { regionName } from '../../lib/region/region-name.ts';
import { regionsOf } from '../../lib/region/regions-of.ts';
import { rssXml } from '../../lib/seo/rss-xml.ts';
import type { APIRoute } from 'astro';

// A feed per region. Aggregators, and the Telegram and Discord bots other
// people run, are distribution we neither build nor operate.
export const prerender = true;

export const getStaticPaths = async () => {
  const payload = await cachedEvents(EVENTS_URL);
  return regionsOf(payload.events).map((entry) => ({
    params: { region: entry.slug },
    props: { region: entry.slug },
  }));
};

export const GET: APIRoute = async ({ props, site }) => {
  const region = String(props['region'] ?? '');
  const payload = await cachedEvents(EVENTS_URL);
  const items = eventRssItems(eventsOfRegion(payload.events, region), isoToday(), site);
  const link = new URL(`/${region}/`, site).toString();
  const self = new URL(`/${region}/rss.xml`, site).toString();
  return new Response(
    rssXml(
      {
        title: `${regionName(region)} — Dove Go`,
        link,
        self,
        description: `Upcoming events in ${regionName(region)}.`,
      },
      items,
    ),
    { headers: { 'content-type': 'application/rss+xml; charset=utf-8' } },
  );
};
