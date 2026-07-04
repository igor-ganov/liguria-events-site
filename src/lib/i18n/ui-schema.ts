import { Schema } from 'effect';
import { LOCALES } from './locales.ts';

const cat = Schema.Struct({
  music: Schema.String, theatre: Schema.String, art: Schema.String, food: Schema.String,
  sport: Schema.String, family: Schema.String, market: Schema.String, nightlife: Schema.String,
  culture: Schema.String, workshop: Schema.String, other: Schema.String,
});

/** UI dict as embedded in the page's #ui-data island; mirrors the content
 *  collection schema. Decoded on the client with English fallback. */
export const PageDataSchema = Schema.Struct({
  lang: Schema.Literal(...LOCALES),
  ui: Schema.Struct({
    nav: Schema.Struct({ calendar: Schema.String, feed: Schema.String, bot: Schema.String, ical: Schema.String }),
    chips: Schema.Struct({ free: Schema.String, gems: Schema.String, clear: Schema.String }),
    cat,
    weekdays: Schema.Array(Schema.String),
    months: Schema.Array(Schema.String),
    headings: Schema.Struct({ ongoing: Schema.String, sources: Schema.String, allEvents: Schema.String }),
    calNav: Schema.Struct({ prev: Schema.String, next: Schema.String }),
    badges: Schema.Struct({ free: Schema.String, gem: Schema.String }),
    empty: Schema.String,
    footer: Schema.String,
    photoBy: Schema.String,
    summaryNote: Schema.String,
    mapLink: Schema.String,
  }),
});

export type PageData = Schema.Schema.Type<typeof PageDataSchema>;
export type Ui = PageData['ui'];
