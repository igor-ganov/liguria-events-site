import { branch } from '../../lib/branch.ts';
import type { RouteDay } from '../../lib/favorites/build-route.ts';

/** The name a generated route is saved under: its first day and how many stops
 *  it holds ("2026-07-10 (7)"). */
export const routeSaveName = (days: readonly RouteDay[]): string =>
  branch(days.length === 0)(
    () => 'Route',
    () => `${days.at(0)?.day ?? ''} (${days.reduce((n, day) => n + day.stops.length, 0)})`,
  );
