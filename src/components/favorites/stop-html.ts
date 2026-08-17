import { stopBody } from './stop-body.ts';
import type { RouteStop } from '../../lib/favorites/build-route.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { Durations } from './render-types.ts';

/** One numbered stop row of the read-only itinerary. */
export const stopHtml = (event: RouteStop, n: number, lang: Locale, overrides: Durations): string =>
  `<li class="route-stop"><span class="route-num">${n}</span>${stopBody(event, lang, overrides)}</li>`;
