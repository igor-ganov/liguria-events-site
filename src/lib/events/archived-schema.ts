import { Either, Schema } from 'effect';

/** An archived page, as the collector lists it: the parts an address is
 *  spelled from, and nothing else. It is not an EventSchema — an archive entry
 *  carries no categories and no source url, because a sitemap needs neither. */
const ArchivedSchema = Schema.Struct({
  id: Schema.String,
  t: Schema.String,
  v: Schema.optional(Schema.String),
  s: Schema.String,
  e: Schema.optional(Schema.String),
  ct: Schema.optional(Schema.String),
  cr: Schema.optional(Schema.Number),
});

export type ArchivedEvent = Schema.Schema.Type<typeof ArchivedSchema>;

const decode = Schema.decodeUnknownEither(Schema.Array(ArchivedSchema));

/** Malformed → empty: an archive the build cannot read costs the sitemap its
 *  archive, never the build. */
export const decodeArchived = (value: unknown): readonly ArchivedEvent[] =>
  Either.getOrElse(decode(value), () => []);
