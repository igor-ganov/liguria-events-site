import type { Coords, Mode } from './route-types.ts';

/** Google Maps directions deep-link between two points for the chosen mode. */
export const mapsDirUrl = (from: Coords, to: Coords, mode: Mode): string =>
  `https://www.google.com/maps/dir/?api=1&origin=${from[0]},${from[1]}&destination=${to[0]},${to[1]}&travelmode=${mode}`;
