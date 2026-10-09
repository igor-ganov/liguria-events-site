import { cachedEvents } from '../../../data/cached-events.ts';
import { EVENTS_URL } from '../../../data/events-url.ts';
import { isDefined } from '../../../lib/is-defined.ts';
import { LOCALES } from '../../../lib/i18n/locales.ts';
import { searchDescs } from '../../../lib/events/search-descs.ts';
import type { APIRoute, GetStaticPaths } from 'astro';
import type { Locale } from '../../../lib/i18n/locales.ts';

// The descriptions of a region's events, for the feed's search — see
// searchDescs. One file per region and language, emitted at build time and
// fetched only by a reader who searches.
export const prerender = true;

export const getStaticPaths: GetStaticPaths = async () => {
  const { events } = await cachedEvents(EVENTS_URL);
  const regions = [...new Set(events.map((event) => event.rg).filter(isDefined))];
  return regions.flatMap((region) => LOCALES.map((lang) => ({ params: { region, lang }, props: { region, lang } })));
};

type Props = Readonly<{ region: string; lang: Locale }>;

export const GET: APIRoute<Props> = async ({ props }) => {
  const { events } = await cachedEvents(EVENTS_URL);
  return Response.json(searchDescs(events, props.region, props.lang));
};
