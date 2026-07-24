import { Schema } from 'effect';
import { LOCALES } from './locales.ts';

const cat = Schema.Struct({
  music: Schema.String, theatre: Schema.String, art: Schema.String, food: Schema.String,
  sport: Schema.String, family: Schema.String, market: Schema.String, nightlife: Schema.String,
  culture: Schema.String, workshop: Schema.String, other: Schema.String,
});

const landmarkKinds = Schema.Struct({
  castle: Schema.String, church: Schema.String, museum: Schema.String, palace: Schema.String,
  monument: Schema.String, tower: Schema.String, lighthouse: Schema.String, square: Schema.String,
  park: Schema.String, heritage: Schema.String, beach: Schema.String, attraction: Schema.String,
});

const placeCats = Schema.Struct({
  restaurant: Schema.String, cafe: Schema.String, bar: Schema.String, fastfood: Schema.String,
  icecream: Schema.String, nightlife: Schema.String, fitness: Schema.String, climbing: Schema.String,
  sport: Schema.String, cinema: Schema.String, entertainment: Schema.String, museum: Schema.String,
  gallery: Schema.String, wellness: Schema.String, kids: Schema.String, shopping: Schema.String,
});

/** UI dict as embedded in the page's #ui-data island; mirrors the content
 *  collection schema. Decoded on the client with English fallback. */
export const PageDataSchema = Schema.Struct({
  lang: Schema.Literal(...LOCALES),
  ui: Schema.Struct({
    nav: Schema.Struct({ calendar: Schema.String, feed: Schema.String, map: Schema.String, landmarks: Schema.String, places: Schema.String, bot: Schema.String, ical: Schema.String }),
    search: Schema.Struct({ placeholder: Schema.String, none: Schema.String }),
    mapLayers: Schema.Struct({ events: Schema.String, landmarks: Schema.String, places: Schema.String }),
    landmarks: Schema.Struct({
      title: Schema.String, intro: Schema.String, more: Schema.String, empty: Schema.String,
      search: Schema.String, kinds: landmarkKinds,
    }),
    places: Schema.Struct({
      title: Schema.String, intro: Schema.String, empty: Schema.String,
      search: Schema.String, hours: Schema.String, rating: Schema.String,
      phone: Schema.String, address: Schema.String, categories: placeCats,
    }),
    reviews: Schema.Struct({
      title: Schema.String, none: Schema.String, rating: Schema.String, comment: Schema.String,
      submit: Schema.String, signIn: Schema.String, remove: Schema.String, yours: Schema.String,
    }),
    map: Schema.Struct({ retry: Schema.String, failed: Schema.String, locate: Schema.String }),
    auth: Schema.Struct({
      signIn: Schema.String, title: Schema.String, emailPrompt: Schema.String, sendCode: Schema.String,
      or: Schema.String, passkey: Schema.String, codePre: Schema.String, codePost: Schema.String,
      verify: Schema.String, back: Schema.String, signOut: Schema.String, addEvent: Schema.String,
      moderation: Schema.String, users: Schema.String, addPasskey: Schema.String,
      settings: Schema.String, account: Schema.String,
      sending: Schema.String, invalidEmail: Schema.String, verifying: Schema.String, badCode: Schema.String,
      lookingPasskey: Schema.String, waitingPasskey: Schema.String, passkeyFailed: Schema.String,
    }),
    chips: Schema.Struct({ free: Schema.String, gems: Schema.String, clear: Schema.String }),
    theme: Schema.Struct({ toggle: Schema.String, light: Schema.String, dark: Schema.String, system: Schema.String }),
    range: Schema.Struct({ from: Schema.String, to: Schema.String }),
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
