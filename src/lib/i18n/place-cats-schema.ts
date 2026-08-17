import { Schema } from 'effect';

/** Place category labels — one per member of PlaceCategory. */
export const PlaceCatsSchema = Schema.Struct({
  restaurant: Schema.String, cafe: Schema.String, bar: Schema.String, fastfood: Schema.String,
  icecream: Schema.String, nightlife: Schema.String, fitness: Schema.String, climbing: Schema.String,
  sport: Schema.String, cinema: Schema.String, entertainment: Schema.String, museum: Schema.String,
  gallery: Schema.String, wellness: Schema.String, kids: Schema.String, shopping: Schema.String,
});
