import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const cat = z.object({
  music: z.string(), theatre: z.string(), art: z.string(), food: z.string(),
  sport: z.string(), family: z.string(), market: z.string(), nightlife: z.string(),
  culture: z.string(), workshop: z.string(), other: z.string(),
});

const landmarkKinds = z.object({
  castle: z.string(), church: z.string(), museum: z.string(), palace: z.string(),
  monument: z.string(), tower: z.string(), lighthouse: z.string(), square: z.string(),
  park: z.string(), heritage: z.string(), beach: z.string(), attraction: z.string(),
});

const placeCats = z.object({
  restaurant: z.string(), cafe: z.string(), bar: z.string(), fastfood: z.string(),
  icecream: z.string(), nightlife: z.string(), fitness: z.string(), climbing: z.string(),
  sport: z.string(), cinema: z.string(), entertainment: z.string(), museum: z.string(),
  gallery: z.string(), wellness: z.string(), kids: z.string(), shopping: z.string(),
});

// UI chrome copy per locale (i18n design §3). Every field is required, so a
// missing key in any language file fails the build (AC-2.2).
const ui = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/ui' }),
  schema: z.object({
    nav: z.object({ calendar: z.string(), feed: z.string(), map: z.string(), landmarks: z.string(), places: z.string(), bot: z.string(), ical: z.string() }),
    search: z.object({ placeholder: z.string(), none: z.string() }),
    mapLayers: z.object({ events: z.string(), landmarks: z.string(), places: z.string() }),
    landmarks: z.object({
      title: z.string(), intro: z.string(), more: z.string(), empty: z.string(),
      search: z.string(), kinds: landmarkKinds,
    }),
    places: z.object({
      title: z.string(), intro: z.string(), empty: z.string(),
      search: z.string(), categories: placeCats,
    }),
    map: z.object({ retry: z.string(), failed: z.string(), locate: z.string() }),
    auth: z.object({
      signIn: z.string(), title: z.string(), emailPrompt: z.string(), sendCode: z.string(),
      or: z.string(), passkey: z.string(), codePre: z.string(), codePost: z.string(),
      verify: z.string(), back: z.string(), signOut: z.string(), addEvent: z.string(),
      moderation: z.string(), users: z.string(), addPasskey: z.string(),
      sending: z.string(), invalidEmail: z.string(), verifying: z.string(), badCode: z.string(),
      lookingPasskey: z.string(), waitingPasskey: z.string(), passkeyFailed: z.string(),
    }),
    chips: z.object({ free: z.string(), gems: z.string(), clear: z.string() }),
    theme: z.object({ toggle: z.string(), light: z.string(), dark: z.string(), system: z.string() }),
    range: z.object({ from: z.string(), to: z.string() }),
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
