import { escHtml } from './esc-html.ts';
import { legParts } from './leg-parts.ts';
import { mapsLink } from './maps-link.ts';
import { when } from './when.ts';
import { distanceLabel } from '../../lib/favorites/distance-label.ts';
import type { Leg, Mode } from '../../lib/favorites/build-route.ts';
import type { Ui } from './render-types.ts';

/** One travel leg between two stops of a day. */
export const renderLeg = (leg: Leg, mode: Mode, ui: Ui): string =>
  `<li class="route-leg${when(leg.tight, ' route-leg--tight')}${when(leg.real === true, ' route-leg--real')}"` +
  `${when(leg.real === true, ' data-real="1"')}>` +
  `<span class="route-leg-mode" data-mode="${mode}"></span>` +
  `<span>${distanceLabel(leg.meters)} · ${leg.minutes} ${escHtml(ui.route.min)}` +
  when(Boolean(leg.transfers), ` · ⇄ ${leg.transfers}`) +
  when(leg.tight, ` · ⚠ ${escHtml(ui.route.tight)}`) +
  `</span>` +
  legParts(leg) +
  mapsLink(leg.mapsUrl) +
  `</li>`;
