import { Schema } from 'effect';
import { LandmarkKindsSchema } from './landmark-kinds-schema.ts';

/** Copy for the landmarks index, its cards and the kind chips. */
export const LandmarksUiSchema = Schema.Struct({
  title: Schema.String, intro: Schema.String, more: Schema.String, empty: Schema.String,
  search: Schema.String, kinds: LandmarkKindsSchema,
});
