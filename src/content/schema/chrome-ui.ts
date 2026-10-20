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
  // The front door. Declared HERE as well as in ui-dict-schema: the content
  // collection strips any key its zod schema does not name, so a string that
  // exists in the dictionary, in the Effect schema and in all three language
  // files still arrives undefined at render time. It did, and the build said
  // "Cannot read properties of undefined (reading 'hereCity')".
  entry: z.object({
    heading: z.string(), lead: z.string(), pickHeading: z.string(),
    regionsHeading: z.string(), hereRegion: z.string(), hereCity: z.string(),
    /** What the calendar and the map are OF when they are not of a region. */
    country: z.string(),
  }),
  menu: z.object({ events: z.string(), explore: z.string(), more: z.string() }),
  venues: z.object({
    title: z.string(), lead: z.string(), stepsHeading: z.string(), stepPage: z.string(),
    stepDates: z.string(), stepWidget: z.string(), widgetHeading: z.string(), widgetLead: z.string(),
    scriptLabel: z.string(), plainLabel: z.string(), preview: z.string(), pick: z.string(), submit: z.string(),
  }),
  seo: z.object({ venueCount: z.object({ one: z.string().optional(), few: z.string().optional(), many: z.string().optional(), other: z.string() }), venueTitle: z.string(), feedTitle: z.string(), venuesHere: z.string(), venuesAround: z.string(), pastHere: z.string(), pastNote: z.string(), venue: z.string(), feed: z.string(), calendar: z.string(), map: z.string() }),
};
