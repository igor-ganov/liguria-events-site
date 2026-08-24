import { ADS } from './limits.ts';
import { fitDescriptions, fitHeadlines } from './fit.ts';
import { runnable } from './runnable.ts';
import type { AdGroup } from './ad-group.ts';

/** Search demand we already appear for is place- and venue-shaped: "acquario
 *  eventi genova", "eventi genova questo weekend". These follow that shape
 *  rather than the "cosa fare in Italia" phrasing nobody types. */
const KEYWORDS = [
  'eventi {city}',
  'cosa fare a {city}',
  'eventi {city} oggi',
  'cosa fare a {city} oggi',
  'eventi {city} weekend',
  'cosa fare a {city} questo weekend',
  'eventi gratis {city}',
  'concerti {city}',
  'mostre {city}',
];

const HEADLINES = [
  'Eventi a {city}',
  'Cosa fare a {city}',
  'Eventi oggi a {city}',
  'Weekend a {city}',
  'Eventi gratis a {city}',
  'Concerti a {city}',
  'Mostre a {city}',
  "L'agenda di {city}",
  'Cosa fare stasera',
  'Aggiornato ogni giorno',
  'Date, orari e biglietti',
  'Tutti gli eventi in un posto',
  'Cerca per data o categoria',
  'Anche gli eventi gratuiti',
  'Aggiungi al tuo calendario',
];

const DESCRIPTIONS = [
  'Concerti, mostre, teatro e sagre a {city}. Date, orari e biglietti aggiornati.',
  "Tutto quello che c'è da fare a {city}, in un'unica agenda aggiornata ogni giorno.",
  'Cerca per data, categoria o luogo. Anche gli eventi a ingresso gratuito.',
  'Aggiungi gli eventi al tuo calendario e non perderne nessuno.',
];

const fill = (template: string, city: string): string => template.replaceAll('{city}', city);

/** One ad group per city we can actually fill. */
export const cityAdGroup = (
  city: Readonly<{ name: string; url: string; events: number }>,
): AdGroup | undefined =>
  city.events < ADS.minCityEvents
    ? undefined
    : runnable({
        name: `Città — ${city.name}`,
        url: city.url,
        keywords: KEYWORDS.map((template) => fill(template, city.name.toLowerCase())),
        headlines: fitHeadlines(HEADLINES.map((template) => fill(template, city.name))),
        descriptions: fitDescriptions(DESCRIPTIONS.map((template) => fill(template, city.name))),
      });
