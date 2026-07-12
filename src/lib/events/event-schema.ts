import { Schema } from 'effect';
import { CATEGORIES } from './categories.ts';

const SourceLinkSchema = Schema.Struct({
  source: Schema.String,
  url: Schema.String,
});

/** Per-language description map (en always present; it/ru fall back to en). */
const LocalizedTextSchema = Schema.Struct({
  en: Schema.String,
  it: Schema.String,
  ru: Schema.String,
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
  /** City slug the event is filed under (province capital). */
  ct: Schema.optional(Schema.String),
  u: Schema.String,
  img: Schema.optional(Schema.String),
  d: Schema.optional(LocalizedTextSchema),
  l: Schema.optional(Schema.Array(SourceLinkSchema)),
  x: Schema.optional(Schema.Boolean),
});

export type CompactEvent = Schema.Schema.Type<typeof EventSchema>;
export type SourceLink = Schema.Schema.Type<typeof SourceLinkSchema>;
