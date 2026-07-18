import { Schema } from 'effect';
import { LANDMARK_KINDS } from './landmark-kinds.ts';

/** One landmark as served to the client: already resolved to a single locale
 *  (name/desc/wiki are the viewed language, en-fallback), so the payload is a
 *  third of the master's. Built by scripts/build-landmarks.ts → public/data. */
export const LandmarkSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  lat: Schema.Number,
  lng: Schema.Number,
  kind: Schema.Literal(...LANDMARK_KINDS),
  region: Schema.String,
  img: Schema.optional(Schema.String),
  desc: Schema.optional(Schema.String),
  wiki: Schema.optional(Schema.String),
  wd: Schema.optional(Schema.String),
});

export type Landmark = Schema.Schema.Type<typeof LandmarkSchema>;
