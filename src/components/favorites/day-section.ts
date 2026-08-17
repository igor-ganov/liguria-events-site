import { baseLegs } from './base-legs.ts';
import { dayRows } from './day-rows.ts';
import { escHtml } from './esc-html.ts';
import { gmapsButton } from './gmaps-button.ts';
import { dayLabel } from '../../lib/favorites/day-label.ts';
import type { RouteDay } from '../../lib/favorites/build-route.ts';
import type { ItineraryOpts } from './render-types.ts';

/** One day of the read-only itinerary: heading, base legs, stops and legs. */
export const daySection = (day: RouteDay, offset: number, opts: ItineraryOpts): string => {
  const db = opts.baseOf?.(day.day);
  const bl = baseLegs(day, db, opts.mode, opts.ui);
  return (
    `<section class="route-day"><h3>${escHtml(dayLabel(day.day, opts.lang))}${gmapsButton(day, opts.mode, db)}</h3>` +
    `<ul class="route-list">${bl.before}${dayRows(day, offset, opts)}${bl.after}</ul></section>`
  );
};
