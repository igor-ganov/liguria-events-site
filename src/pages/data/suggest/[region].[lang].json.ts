import { cachedEvents } from '../../../data/cached-events.ts';
import { EVENTS_URL } from '../../../data/events-url.ts';
import { isDefined } from '../../../lib/is-defined.ts';
import { isoToday } from '../../../lib/calendar/iso-today.ts';
import { LOCALES } from '../../../lib/i18n/locales.ts';
import { suggestDocs } from '../../../lib/suggest/suggest-docs.ts';
import type { APIRoute, GetStaticPaths } from 'astro';
import type { Locale } from '../../../lib/i18n/locales.ts';

// What a region's search box can suggest, in one language — see suggestDocs.
// Fetched when the box is first touched, matched by letters on the device
// (and offline: /data/ is kept by the service worker), and the list the ids
// the worker answers by meaning are looked up in.
export const prerender = true;

export const getStaticPaths: GetStaticPaths = async () => {
  const { events } = await cachedEvents(EVENTS_URL);
  const regions = [...new Set(events.map((event) => event.rg).filter(isDefined))];
  return regions.flatMap((region) => LOCALES.map((lang) => ({ params: { region, lang }, props: { region, lang } })));
};

type Props = Readonly<{ region: string; lang: Locale }>;

export const GET: APIRoute<Props> = async ({ props }) => {
  const { events } = await cachedEvents(EVENTS_URL);
  return Response.json(suggestDocs(events, props.region, props.lang, isoToday()));
};
