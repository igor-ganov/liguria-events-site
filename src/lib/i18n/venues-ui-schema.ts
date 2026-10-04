import { Schema } from 'effect';

/** The page that asks a venue for its dates and offers it a widget in return.
 *  Its own file because the dictionary schema it belongs to is at its limit. */
export const VenuesUiSchema = Schema.Struct({
  title: Schema.String,
  lead: Schema.String,
  stepsHeading: Schema.String,
  stepPage: Schema.String,
  stepDates: Schema.String,
  stepWidget: Schema.String,
  widgetHeading: Schema.String,
  widgetLead: Schema.String,
  scriptLabel: Schema.String,
  plainLabel: Schema.String,
  preview: Schema.String,
  pick: Schema.String,
  submit: Schema.String,
});
