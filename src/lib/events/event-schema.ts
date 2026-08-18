import { Schema } from 'effect';
import { CATEGORIES } from './categories.ts';

const SourceLinkSchema = Schema.Struct({
  source: Schema.String,
  url: Schema.String,
  /** That source's own cover image — feeds the multi-source gallery. */
  image: Schema.optional(Schema.String),
});

/** Per-language description map (en always present; it/ru fall back to en). */
const LocalizedTextSchema = Schema.Struct({
  en: Schema.String,
  it: Schema.String,
  ru: Schema.String,
});

/** One dated occurrence inside an umbrella event — the specific concert on a
 *  given night of a months-long run. */
const SessionSchema = Schema.Struct({
  date: Schema.String,
  time: Schema.optional(Schema.String),
  title: Schema.optional(Schema.String),
});

/** Compact event as served by the worker's /events.json (AC-1.2):
 *  c=categories (1..3) img=cover d=AI summary l=other sources' links. */
export const EventSchema = Schema.Struct({
  id: Schema.String,
  t: Schema.String,
  tl: Schema.optional(LocalizedTextSchema),
  s: Schema.String,
  e: Schema.optional(Schema.String),
  c: Schema.Array(Schema.Literal(...CATEGORIES)),
  f: Schema.optional(Schema.Boolean),
  v: Schema.optional(Schema.String),
  a: Schema.optional(Schema.String),
  g: Schema.optional(Schema.Tuple(Schema.Number, Schema.Number)),
  h: Schema.optional(Schema.String),
  /** City slug (province capital) — the crawler's geocoding anchor. */
  ct: Schema.optional(Schema.String),
  /** Region slug — the slice the site is browsed by. */
  rg: Schema.optional(Schema.String),
  u: Schema.String,
  img: Schema.optional(Schema.String),
  /** Attendance length in minutes, when the source stated one (AC-duration). */
  du: Schema.optional(Schema.Number),
  /** Programme: the dated occurrences inside an umbrella event, so the feed can
   *  show the specific one on each day rather than the whole run. */
  p: Schema.optional(Schema.Array(SessionSchema)),
  /** Container: the event happens ONLY on its programmed dates, so it must not
   *  appear on the empty days in between. Absent means standalone — the event
   *  owns its whole span. */
  k: Schema.optional(Schema.Boolean),
  d: Schema.optional(LocalizedTextSchema),
  l: Schema.optional(Schema.Array(SourceLinkSchema)),
  x: Schema.optional(Schema.Boolean),
  /** First-seen time (epoch seconds) — powers the "newest added first" sort. */
  cr: Schema.optional(Schema.Number),
});

export type CompactEvent = Schema.Schema.Type<typeof EventSchema>;
export type SourceLink = Schema.Schema.Type<typeof SourceLinkSchema>;
export type Session = Schema.Schema.Type<typeof SessionSchema>;
