import { z } from 'astro:content';

/** Place category labels — one per member of PLACE_CATEGORIES. */
const placeCategories = z.object({
  restaurant: z.string(), cafe: z.string(), bar: z.string(), fastfood: z.string(),
  icecream: z.string(), nightlife: z.string(), fitness: z.string(), climbing: z.string(),
  sport: z.string(), cinema: z.string(), entertainment: z.string(), museum: z.string(),
  gallery: z.string(), wellness: z.string(), kids: z.string(), shopping: z.string(),
});

/** Copy for the places catalogue, its map layer and a place's facts. */
export const placesUi = z.object({
  title: z.string(), intro: z.string(), empty: z.string(),
  search: z.string(), hours: z.string(), rating: z.string(),
  phone: z.string(), address: z.string(), categories: placeCategories,
});
