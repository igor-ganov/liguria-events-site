import { escHtml } from './esc-html.ts';
import { mapsLink } from './maps-link.ts';
import { distanceLabel } from '../../lib/favorites/distance-label.ts';
import type { Leg, Mode } from '../../lib/favorites/build-route.ts';
import type { Ui } from './render-types.ts';

/** A leg between the day's base (accommodation) and its first/last stop. */
export const baseLegRow = (leg: Leg, label: string, mode: Mode, ui: Ui): string =>
  `<li class="route-leg route-leg--base"><span class="route-leg-mode" data-mode="${mode}"></span>` +
  `<span>🏠 ${escHtml(label)} · ${distanceLabel(leg.meters)} · ${leg.minutes} ${escHtml(ui.route.min)}</span>` +
  mapsLink(leg.mapsUrl) +
  `</li>`;
