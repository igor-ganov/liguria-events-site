import { BCP47 } from '../i18n/bcp47.ts';
import { cityName } from '../region/city-name.ts';
import type { CompactEvent } from './event-schema.ts';
import type { Locale } from '../i18n/locales.ts';

// What a search result shows before it cuts. Past this, a title we lengthened is
// a title Google truncates, so an already-long one is left as it is.
const ROOM = 62;

const dated = (iso: string, lang: Locale): string =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(BCP47[lang], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

/**
 * The title a search result carries: the event, the city, the day it starts.
 *
 * The queries this site is shown for name things — "caparezza milano 2026",
 * "due forni sestri levante", "acquario di genova ferragosto" — and the page's
 * own title said only the event's name, so the city and the year the query
 * carried appeared nowhere on it. The heading on the page stays the event's
 * name; this is for the tab and the result.
 */
export const eventSeoTitle = (event: CompactEvent, title: string, lang: Locale): string => {
  const city = [event.ct ?? ''].filter((slug) => slug !== '').map(cityName).at(0);
  const day = dated(event.s, lang);
  const parts = [city, day]
    .filter((part): part is string => part !== undefined)
    .filter((part) => !title.toLowerCase().includes(part.toLowerCase()));
  const suffix = parts.join(', ');
  return [suffix]
    .filter((text) => text !== '')
    .filter((text) => title.length + text.length + 3 <= ROOM)
    .map((text) => `${title} — ${text}`)
    .at(0) ?? title;
};
