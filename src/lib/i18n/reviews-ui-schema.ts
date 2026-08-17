import { Schema } from 'effect';

/** Copy for the place review list and its form. */
export const ReviewsUiSchema = Schema.Struct({
  title: Schema.String, none: Schema.String, rating: Schema.String, comment: Schema.String,
  submit: Schema.String, signIn: Schema.String, remove: Schema.String, yours: Schema.String,
});
