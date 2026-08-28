import { Schema } from 'effect';

/** Every word on the make-an-event form. It was written in English inside the
 *  markup, which meant the one thing this site asks people to do could only be
 *  done in English — on a site whose readers are in Italy. */
export const EventFormSchema = Schema.Struct({
  title: Schema.String,
  description: Schema.String,
  image: Schema.String,
  categories: Schema.String,
  starts: Schema.String,
  addDate: Schema.String,
  removeDate: Schema.String,
  dateLabel: Schema.String,
  timeLabel: Schema.String,
  whatIsOn: Schema.String,
  whatIsOnHint: Schema.String,
  venue: Schema.String,
  address: Schema.String,
  addressHint: Schema.String,
  phone: Schema.String,
  website: Schema.String,
  freeEntry: Schema.String,
  mapLabel: Schema.String,
  mapHint: Schema.String,
  submitCreate: Schema.String,
  submitEdit: Schema.String,
  uploadImage: Schema.String,
  replaceImage: Schema.String,
});
