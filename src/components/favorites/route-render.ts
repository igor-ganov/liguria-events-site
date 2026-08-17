// Shared itinerary + map rendering for a route, used both by the favourites
// page (live generation from localStorage) and the /route/[id] page (a saved
// route reopened from its stored payload). This module is the stable import
// surface; every part — markup builder, map helper — lives one function per
// file next to it and is unit-tested on its own. The map drawer is the only
// stateful piece: each page instantiates one.
export type { Durations, LngLat, Ui } from './render-types.ts';
export { escHtml as esc } from './esc-html.ts';
export { dayLabel } from '../../lib/favorites/day-label.ts';
export { renderLeg } from './render-leg.ts';
export { baseLegs } from './base-legs.ts';
export { stopBody } from './stop-body.ts';
export { gmapsButton } from './gmaps-button.ts';
export { renderItinerary } from './render-itinerary.ts';
export { makeMapDrawer } from './make-map-drawer.ts';
