import type { PlaceCategory } from './place-categories.ts';

/** Marker/accent colour per category — a warm, food-and-leisure leaning palette,
 *  kept apart from the cool landmark colours and the event category hues. */
const COLORS: Readonly<Record<PlaceCategory, string>> = {
  restaurant: '#e0563b',
  cafe: '#8d6748',
  bar: '#b5427a',
  fastfood: '#e8912a',
  icecream: '#ec6fa0',
  nightlife: '#7c4dff',
  fitness: '#2f9e6b',
  climbing: '#c2603a',
  sport: '#1e88c9',
  cinema: '#5a4bce',
  entertainment: '#d1483f',
  museum: '#6d7b8d',
  gallery: '#9575cd',
  wellness: '#26a69a',
  kids: '#f4b400',
  shopping: '#4a8f3c',
};

export const placeColor = (cat: PlaceCategory): string => COLORS[cat] ?? '#e0563b';
