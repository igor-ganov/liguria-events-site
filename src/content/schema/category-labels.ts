import { z } from 'astro:content';

/** Event category labels — one per member of CATEGORIES. */
export const categoryLabels = z.object({
  music: z.string(), theatre: z.string(), art: z.string(), food: z.string(),
  sport: z.string(), family: z.string(), market: z.string(), nightlife: z.string(),
  culture: z.string(), workshop: z.string(), other: z.string(),
});
