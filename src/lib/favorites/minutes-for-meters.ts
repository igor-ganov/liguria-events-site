import type { Mode } from './route-types.ts';

// Rough average speeds (m/s) for the travel-time ESTIMATE only — the real
// turn-by-turn comes from the Google Maps deep-link. Transit is deliberately
// conservative (includes waiting).
const SPEED_MPS: Readonly<Record<Mode, number>> = { walking: 1.3, driving: 7.5, transit: 5.5 };

/** Estimated travel time (minutes) for a distance under the chosen mode —
 *  never less than a minute, so every leg reads as taking some time. */
export const minutesForMeters = (meters: number, mode: Mode): number =>
  Math.max(1, Math.round(meters / SPEED_MPS[mode] / 60));
