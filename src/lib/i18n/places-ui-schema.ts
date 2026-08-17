import { Schema } from 'effect';
import { PlaceCatsSchema } from './place-cats-schema.ts';

/** Copy for the places index, its cards and the detail facts. */
export const PlacesUiSchema = Schema.Struct({
  title: Schema.String, intro: Schema.String, empty: Schema.String,
  search: Schema.String, hours: Schema.String, rating: Schema.String,
  phone: Schema.String, address: Schema.String, categories: PlaceCatsSchema,
});
