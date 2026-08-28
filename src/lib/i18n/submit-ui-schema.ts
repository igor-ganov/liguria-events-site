import { Schema } from 'effect';

/** Everything the make-an-event flow says: the invitation to add one, the
 *  sign-in asked for at the moment of sending, who may see it, and the link
 *  handed back once it exists. Split out of the main dictionary, which had
 *  grown past the file limit. */
export const SubmitUiSchema = {
  contribute: Schema.Struct({ link: Schema.String, venue: Schema.String, empty: Schema.String }),
  submitAuth: Schema.Struct({ note: Schema.String, signin: Schema.String }),
  created: Schema.Struct({
    heading: Schema.String,
    linkNote: Schema.String,
    publicNote: Schema.String,
    copy: Schema.String,
    copied: Schema.String,
    sendTo: Schema.String,
    whatsapp: Schema.String,
    telegram: Schema.String,
  }),
  visibility: Schema.Struct({
    legend: Schema.String,
    listedTitle: Schema.String,
    listedNote: Schema.String,
    linkNote: Schema.String,
  }),
};
