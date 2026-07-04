import type { Category } from './categories.ts';

// Category hues mirror the CSS custom properties (--cat-*), so map markers
// match the chip / tag colours.
const HUE: Readonly<Record<Category, number>> = {
  music: 262, theatre: 340, art: 210, food: 26, sport: 145, family: 46,
  market: 6, nightlife: 275, culture: 190, workshop: 100, other: 220,
};

/** Solid marker colour for a category. */
export const categoryColor = (category: Category): string => `hsl(${HUE[category]} 60% 48%)`;
