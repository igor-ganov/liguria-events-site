import { z } from 'astro:content';

/** Route planner copy: modes, saving/sharing, the timeline and per-day bases. */
export const routeUi = z.object({
  walk: z.string(), drive: z.string(), transit: z.string(), generate: z.string(),
  save: z.string(), saved: z.string(), tight: z.string(), min: z.string(),
  empty: z.string(), link: z.string(), saveFailed: z.string(), mine: z.string(),
  open: z.string(), private: z.string(), public: z.string(),
  makePrivate: z.string(), makePublic: z.string(), remove: z.string(),
  title: z.string(), by: z.string(), moveDay: z.string(), moveUp: z.string(),
  moveDown: z.string(), addFav: z.string(), saveChanges: z.string(),
  viewList: z.string(), viewTimeline: z.string(), pdf: z.string(), day: z.string(),
  setDefault: z.string(), setBase: z.string(), setBaseDefault: z.string(),
  clearBase: z.string(), clickMap: z.string(), dayBase: z.string(),
  dayFinal: z.string(), fromBase: z.string(), toBase: z.string(),
});
