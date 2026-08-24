import { Schema } from 'effect';
import { AuthUiSchema } from './auth-ui-schema.ts';
import { CatUiSchema } from './cat-ui-schema.ts';
import { LandmarksUiSchema } from './landmarks-ui-schema.ts';
import { PlacesUiSchema } from './places-ui-schema.ts';
import { ReviewsUiSchema } from './reviews-ui-schema.ts';
import { RouteUiSchema } from './route-ui-schema.ts';

/** Every string the UI renders. The multi-line sections live in their own
 *  modules, so this file stays a readable table of contents. */
export const UiDictSchema = Schema.Struct({
  nav: Schema.Struct({ calendar: Schema.String, feed: Schema.String, map: Schema.String, landmarks: Schema.String, places: Schema.String, favorites: Schema.String, bot: Schema.String, ical: Schema.String }),
  search: Schema.Struct({ placeholder: Schema.String, none: Schema.String }),
  mapLayers: Schema.Struct({ events: Schema.String, landmarks: Schema.String, places: Schema.String }),
  landmarks: LandmarksUiSchema,
  places: PlacesUiSchema,
  reviews: ReviewsUiSchema,
  map: Schema.Struct({ retry: Schema.String, failed: Schema.String, locate: Schema.String }),
  auth: AuthUiSchema,
  chips: Schema.Struct({ free: Schema.String, gems: Schema.String, clear: Schema.String }),
  theme: Schema.Struct({ toggle: Schema.String, light: Schema.String, dark: Schema.String, system: Schema.String }),
  range: Schema.Struct({ from: Schema.String, to: Schema.String }),
  sort: Schema.Struct({ label: Schema.String, date: Schema.String, created: Schema.String }),
  route: RouteUiSchema,
  menu: Schema.Struct({ events: Schema.String, explore: Schema.String, more: Schema.String }),
  seo: Schema.Struct({
    venueCount: Schema.String,
    venueTitle: Schema.String,
    venue: Schema.String, feed: Schema.String, calendar: Schema.String, map: Schema.String }),
  cat: CatUiSchema,
  weekdays: Schema.Array(Schema.String),
  months: Schema.Array(Schema.String),
  headings: Schema.Struct({ ongoing: Schema.String, sources: Schema.String, allEvents: Schema.String }),
  calNav: Schema.Struct({ prev: Schema.String, next: Schema.String }),
  badges: Schema.Struct({ free: Schema.String, gem: Schema.String }),
  facets: Schema.Struct({ today: Schema.Struct({ title: Schema.String, description: Schema.String }), tomorrow: Schema.Struct({ title: Schema.String, description: Schema.String }), weekend: Schema.Struct({ title: Schema.String, description: Schema.String }), free: Schema.Struct({ title: Schema.String, description: Schema.String }) }),
  gone: Schema.Struct({ heading: Schema.String, note: Schema.String, onward: Schema.String }),
  nothingHere: Schema.Struct({ heading: Schema.String, note: Schema.String, onward: Schema.String }),
  empty: Schema.String,
  footer: Schema.String,
  photoBy: Schema.String,
  passedNote: Schema.String,
  summaryNote: Schema.String,
  mapLink: Schema.String,
  tickets: Schema.String,
});
