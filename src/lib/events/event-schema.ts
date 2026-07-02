import { Schema } from 'effect';
import { CATEGORIES } from './categories.ts';

/** Compact event as served by the worker's /events.json (AC-1.2). */
export const EventSchema = Schema.Struct({
  id: Schema.String,
  t: Schema.String,
  s: Schema.String,
  e: Schema.optional(Schema.String),
  c: Schema.Literal(...CATEGORIES),
  f: Schema.optional(Schema.Boolean),
  v: Schema.optional(Schema.String),
  h: Schema.optional(Schema.String),
  u: Schema.String,
});

export type CompactEvent = Schema.Schema.Type<typeof EventSchema>;
