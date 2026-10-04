import type { CompactEvent } from '../events/event-schema.ts';

const DAY_MS = 86_400_000;

const spanDays = (event: CompactEvent): number =>
  (Date.parse(`${event.e ?? event.s}T00:00:00Z`) - Date.parse(`${event.s}T00:00:00Z`)) / DAY_MS;

// One evening is an occasion; a week is a festival; a season is a standing
// offer that will still be there next month.
const brevity = (days: number): number => [3].filter(() => days <= 1).at(0) ?? [1].filter(() => days <= 7).at(0) ?? 0;

const otherPhotos = (event: CompactEvent): number => (event.l ?? []).filter((link) => link.image !== undefined).length;

/**
 * How much an event deserves to be picked out, as a reader would judge it:
 * a hidden gem first, then what several sources thought worth a photograph,
 * then an occasion over a standing offer, then one made on the platform, then
 * one that says when it starts. Nothing here knows the date: whether an event
 * is on at all is decided before it is scored.
 */
export const pickScore = (event: CompactEvent): number =>
  8 * Number(event.x === true) +
  2 * Math.min(otherPhotos(event), 2) +
  brevity(spanDays(event)) +
  2 * Number(event.pl === true) +
  Number(event.h !== undefined);
