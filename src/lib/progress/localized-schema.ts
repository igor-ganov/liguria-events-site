import { Schema } from 'effect';

/** One sentence in each language the site is built in. All three are required:
 *  a missing one would render as an empty element, not as an error. */
export const LocalizedSchema = Schema.Struct({
  en: Schema.String,
  it: Schema.String,
  ru: Schema.String,
});
