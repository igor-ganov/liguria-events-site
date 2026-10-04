import { Schema } from 'effect';
import { LocalizedSchema } from './localized-schema.ts';

const ReleaseSchema = Schema.Struct({
  date: Schema.String,
  title: LocalizedSchema,
  body: LocalizedSchema,
  /** A page on this site where the feature can be seen working. */
  example: Schema.String,
  /** The roadmap item this release delivers, when there is one. */
  roadmap: Schema.optional(Schema.String),
});

export const ReleasesSchema = Schema.Array(ReleaseSchema);

export type Release = Schema.Schema.Type<typeof ReleaseSchema>;
