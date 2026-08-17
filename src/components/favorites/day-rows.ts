import { isDefined } from '../../lib/is-defined.ts';
import { renderLeg } from './render-leg.ts';
import { stopHtml } from './stop-html.ts';
import type { RouteDay } from '../../lib/favorites/build-route.ts';
import type { ItineraryOpts } from './render-types.ts';

// The leg that leads INTO a stop: none for the first one of the day.
const legBefore = (day: RouteDay, i: number, opts: ItineraryOpts): string =>
  [day.legs[i - 1]].filter(isDefined).map((leg) => renderLeg(leg, opts.mode, opts.ui)).join('');

/** A day's stop rows, each preceded by the leg that leads into it. */
export const dayRows = (day: RouteDay, offset: number, opts: ItineraryOpts): string =>
  day.stops
    .map((stop, i) => legBefore(day, i, opts) + stopHtml(stop, offset + i + 1, opts.lang, opts.overrides))
    .join('');
