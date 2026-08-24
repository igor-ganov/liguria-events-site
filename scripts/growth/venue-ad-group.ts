import { ADS } from './limits.ts';
import { fitDescriptions, fitHeadlines } from './fit.ts';
import { runnable } from './runnable.ts';
import type { AdGroup } from './ad-group.ts';

// The queries the site already surfaces for are venue-shaped — "acquario
// eventi genova", "museo delle illusioni genova". Somebody with a place in
// mind, asking what is on there.
const KEYWORDS = [
  '{venue} eventi',
  'eventi {venue}',
  '{venue} programma',
  '{venue} spettacoli',
  '{venue} biglietti',
  '{venue} {city}',
];

const HEADLINES = [
  '{venue}: eventi',
  'Programma {venue}',
  'Spettacoli a {venue}',
  'Biglietti {venue}',
  'Cosa c\u2019\u00e8 a {venue}',
  'Eventi a {city}',
  'Date, orari e biglietti',
  'Aggiornato ogni giorno',
  'Il calendario completo',
  'Anche gli eventi gratuiti',
];

const DESCRIPTIONS = [
  'Il programma di {venue}: date, orari, biglietti e come arrivare.',
  'Tutti gli spettacoli e le mostre a {venue}, in un calendario aggiornato.',
  'Scopri cosa c\u2019\u00e8 a {venue} e nel resto di {city}.',
  'Aggiungi le date al tuo calendario e non perderne nessuna.',
];

const fill = (template: string, venue: string, city: string): string =>
  template.replaceAll('{venue}', venue).replaceAll('{city}', city);

/** A venue is worth advertising only while it has something on: the page is
 *  kept either way, but paying to send somebody to an empty one is not. */
export const venueAdGroup = (
  venue: Readonly<{ name: string; city: string; url: string; events: number }>,
): AdGroup | undefined =>
  venue.events < ADS.minVenueEvents
    ? undefined
    : runnable({
        name: `Luogo — ${venue.name}`,
        url: venue.url,
        keywords: KEYWORDS.map((template) =>
          fill(template, venue.name.toLowerCase(), venue.city.toLowerCase()),
        ),
        headlines: fitHeadlines(HEADLINES.map((template) => fill(template, venue.name, venue.city))),
        descriptions: fitDescriptions(
          DESCRIPTIONS.map((template) => fill(template, venue.name, venue.city)),
        ),
      });
