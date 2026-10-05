import { Schema } from 'effect';

/** The sentence a feed page says about itself: the place, the days it covers,
 *  how much is in it and what kind. Its own module because the dictionary
 *  schema it belongs to is a table of contents, not a place for structs. */
export const LeadUiSchema = Schema.Struct({
  line: Schema.String,
  /** "{n} eventi in programma", in the forms the language needs. */
  events: Schema.Struct({
    one: Schema.optional(Schema.String),
    few: Schema.optional(Schema.String),
    many: Schema.optional(Schema.String),
    other: Schema.String,
  }),
  now: Schema.String,
});
