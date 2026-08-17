import { Schema } from 'effect';

/** Event category labels — one per member of CATEGORIES. */
export const CatUiSchema = Schema.Struct({
  music: Schema.String, theatre: Schema.String, art: Schema.String, food: Schema.String,
  sport: Schema.String, family: Schema.String, market: Schema.String, nightlife: Schema.String,
  culture: Schema.String, workshop: Schema.String, other: Schema.String,
});
