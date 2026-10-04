import { Schema } from 'effect';
import { LocalizedSchema } from './localized-schema.ts';
import { STAGES } from './stages.ts';

const RoadmapItemSchema = Schema.Struct({
  /** Stable handle a release note refers to; never shown. */
  id: Schema.String,
  stage: Schema.Literal(...STAGES),
  title: LocalizedSchema,
  note: LocalizedSchema,
  /** The day it reached readers (YYYY-MM-DD) — present exactly when done. */
  shipped: Schema.optional(Schema.String),
});

export const RoadmapSchema = Schema.Array(RoadmapItemSchema);

export type RoadmapItem = Schema.Schema.Type<typeof RoadmapItemSchema>;
