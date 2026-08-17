import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { accountUi } from './content/schema/account-ui.ts';
import { categoryLabels } from './content/schema/category-labels.ts';
import { chromeUi } from './content/schema/chrome-ui.ts';
import { landmarksUi } from './content/schema/landmarks-ui.ts';
import { placesUi } from './content/schema/places-ui.ts';
import { reviewsUi } from './content/schema/reviews-ui.ts';
import { routeUi } from './content/schema/route-ui.ts';

// UI chrome copy per locale (i18n design §3). Every field is required, so a
// missing key in any language file fails the build (AC-2.2). The field groups
// live in ./content/schema/* — one module per area of the interface.
const ui = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/ui' }),
  schema: z.object({
    ...chromeUi,
    landmarks: landmarksUi,
    places: placesUi,
    reviews: reviewsUi,
    auth: accountUi,
    route: routeUi,
    cat: categoryLabels,
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
    tickets: z.string(),
  }),
});

export const collections = { ui };
