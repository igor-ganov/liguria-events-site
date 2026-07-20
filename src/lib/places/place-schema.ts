import { Schema } from 'effect';
import { PLACE_CATEGORIES } from './place-categories.ts';

/** One place as served to the client: resolved to a single locale, built by
 *  scripts/build-places.ts (OSM + Overture + Wikidata) → public/data. */
export const PlaceSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  lat: Schema.Number,
  lng: Schema.Number,
  cat: Schema.Literal(...PLACE_CATEGORIES),
  region: Schema.String,
  img: Schema.optional(Schema.String),
  desc: Schema.optional(Schema.String),
  website: Schema.optional(Schema.String),
  /** OSM `opening_hours` string (raw spec, e.g. "Mo-Fr 09:00-18:00"). */
  hours: Schema.optional(Schema.String),
  /** Contact info from Overture/OSM (far better covered than hours/desc). */
  phone: Schema.optional(Schema.String),
  socials: Schema.optional(Schema.Array(Schema.String)),
  address: Schema.optional(Schema.String),
  wiki: Schema.optional(Schema.String),
  wd: Schema.optional(Schema.String),
});

export type Place = Schema.Schema.Type<typeof PlaceSchema>;
