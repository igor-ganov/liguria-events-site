import { escHtml } from './esc-html.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { googleMapsUrl } from '../../lib/favorites/google-maps.ts';
import type { DayBase } from '../../lib/favorites/base-point.ts';
import type { Mode, RouteDay } from '../../lib/favorites/build-route.ts';

/** The "open the day in Google Maps" button (English — the route page is
 *  English-only); empty when the day has too few located stops to route. */
export const gmapsButton = (day: RouteDay, mode: Mode, db?: DayBase): string =>
  [googleMapsUrl(day, mode, db)]
    .filter(isDefined)
    .map(
      (url) =>
        `<a class="route-gmaps no-print" href="${escHtml(url)}" target="_blank" rel="noopener noreferrer" ` +
        `title="Open this day as a route in Google Maps">↗ Google Maps</a>`,
    )
    .join('');
