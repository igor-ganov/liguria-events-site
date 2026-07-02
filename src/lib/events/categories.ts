/** Closed category taxonomy — mirrors the worker's domain (AC-1.2). */
export const CATEGORIES = [
  'music',
  'theatre',
  'art',
  'food',
  'sport',
  'family',
  'market',
  'nightlife',
  'culture',
  'workshop',
  'other',
] as const;

export type Category = (typeof CATEGORIES)[number];
