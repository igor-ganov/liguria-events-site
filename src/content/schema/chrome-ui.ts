import { z } from 'astro:content';

/** Site chrome: navigation, search, filters, theme, sorting and the map shell. */
export const chromeUi = {
  nav: z.object({
    calendar: z.string(), feed: z.string(), map: z.string(), landmarks: z.string(),
    places: z.string(), favorites: z.string(), bot: z.string(), ical: z.string(),
  }),
  search: z.object({ placeholder: z.string(), none: z.string() }),
  mapLayers: z.object({ events: z.string(), landmarks: z.string(), places: z.string() }),
  map: z.object({ retry: z.string(), failed: z.string(), locate: z.string() }),
  chips: z.object({ free: z.string(), gems: z.string(), made: z.string(), clear: z.string() }),
  theme: z.object({ toggle: z.string(), light: z.string(), dark: z.string(), system: z.string() }),
  range: z.object({ from: z.string(), to: z.string() }),
  sort: z.object({ label: z.string(), date: z.string(), created: z.string() }),
  menu: z.object({ events: z.string(), explore: z.string(), more: z.string() }),
  seo: z.object({ venueCount: z.string(), venueTitle: z.string(), venue: z.string(), feed: z.string(), calendar: z.string(), map: z.string() }),
};
