import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const cat = z.object({
  music: z.string(), theatre: z.string(), art: z.string(), food: z.string(),
  sport: z.string(), family: z.string(), market: z.string(), nightlife: z.string(),
  culture: z.string(), workshop: z.string(), other: z.string(),
});

// UI chrome copy per locale (i18n design §3). Every field is required, so a
// missing key in any language file fails the build (AC-2.2).
const ui = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/ui' }),
  schema: z.object({
    nav: z.object({ calendar: z.string(), feed: z.string(), bot: z.string(), ical: z.string() }),
    chips: z.object({ free: z.string(), gems: z.string(), clear: z.string() }),
    cat,
    weekdays: z.array(z.string()).length(7),
    months: z.array(z.string()).length(12),
    headings: z.object({ ongoing: z.string(), sources: z.string(), allEvents: z.string() }),
    calNav: z.object({ prev: z.string(), next: z.string() }),
    badges: z.object({ free: z.string(), gem: z.string() }),
    empty: z.string(),
    footer: z.string(),
    photoBy: z.string(),
    summaryNote: z.string(),
    mapLink: z.string(),
  }),
});

export const collections = { ui };
