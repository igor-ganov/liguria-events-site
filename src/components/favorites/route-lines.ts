import { dayLine } from './day-line.ts';
import type { RouteDay } from '../../lib/favorites/build-route.ts';
import type { Line } from './map-types.ts';

/** One line per day, dropping days with nothing to draw. */
export const routeLines = (days: readonly RouteDay[]): readonly Line[] =>
  days.map(dayLine).filter((line) => line.length > 1);
