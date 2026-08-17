import { Schema } from 'effect';

/** Landmark kind labels — one per member of LANDMARK_KINDS. */
export const LandmarkKindsSchema = Schema.Struct({
  castle: Schema.String, church: Schema.String, museum: Schema.String, palace: Schema.String,
  monument: Schema.String, tower: Schema.String, lighthouse: Schema.String, square: Schema.String,
  park: Schema.String, heritage: Schema.String, beach: Schema.String, attraction: Schema.String,
});
