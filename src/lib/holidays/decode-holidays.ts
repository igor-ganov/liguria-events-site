import { Schema } from 'effect';
import { MOTIFS } from './motifs.ts';

const HolidaySchema = Schema.Struct({
  id: Schema.String,
  name: Schema.Struct({ en: Schema.String, it: Schema.String, ru: Schema.String }),
  /** Inclusive ISO days, Europe/Rome. */
  themeFrom: Schema.String,
  themeTo: Schema.String,
  /** Colours for light and dark backgrounds; checked again before use
   *  (holidayAccent), since a payload is only as good as its producer. */
  theme: Schema.Struct({
    accent: Schema.String,
    accentDark: Schema.String,
    motif: Schema.Literal(...MOTIFS),
  }),
  /** Ids of the events the job assigned to the holiday. */
  events: Schema.Array(Schema.String),
});

const PayloadSchema = Schema.Struct({
  generatedAt: Schema.String,
  holidays: Schema.Array(HolidaySchema),
});

export type Holiday = Schema.Schema.Type<typeof HolidaySchema>;
export type HolidaysPayload = Schema.Schema.Type<typeof PayloadSchema>;

/** Boundary validation of the collector's /holidays.json. */
export const decodeHolidaysPayload = Schema.decodeUnknown(PayloadSchema);
