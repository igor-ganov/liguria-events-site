import { Schema } from 'effect';

/** The strings that end up in a page's head, and in the venue list that links
 *  to what the head describes. Its own file because the dictionary schema it
 *  belongs to had grown past what one file is allowed to hold. */
export const SeoUiSchema = Schema.Struct({
  venueCount: Schema.Struct({
    one: Schema.optional(Schema.String),
    few: Schema.optional(Schema.String),
    many: Schema.optional(Schema.String),
    other: Schema.String,
  }),
  venueTitle: Schema.String,
  venuesHere: Schema.String,
  pastHere: Schema.String,
  pastNote: Schema.String,
  venue: Schema.String,
  feed: Schema.String,
  calendar: Schema.String,
  map: Schema.String,
});
