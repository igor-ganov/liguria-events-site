import type { CompactEvent } from '../events/event-schema.ts';
import type { Category } from '../events/categories.ts';

// Default attendance length per category (minutes), used when the source did
// not state one. A multi-category event takes the LONGEST of its types.
const DEFAULT_MIN: Readonly<Record<Category, number>> = {
  nightlife: 180,
  music: 150,
  theatre: 150,
  sport: 150,
  food: 120,
  workshop: 120,
  art: 90,
  culture: 90,
  family: 90,
  other: 90,
  market: 60,
};

/** Attendance length in minutes: a manual override wins, then a source-stated
 *  duration (event.du), then the longest of the event's category defaults. */
export const eventDuration = (event: CompactEvent, overrideMin?: number): number => {
  if (overrideMin !== undefined && overrideMin > 0) return Math.round(overrideMin);
  if (typeof event.du === 'number' && event.du > 0) return Math.round(event.du);
  const defaults = event.c.map((category) => DEFAULT_MIN[category] ?? 90);
  return defaults.length > 0 ? Math.max(...defaults) : 90;
};

/** '1h 30m' / '2h' / '45m' — a compact human label. */
export const formatDuration = (min: number): string => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
};
