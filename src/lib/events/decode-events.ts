import { Schema } from 'effect';
import { EventSchema } from './event-schema.ts';

const PayloadSchema = Schema.Struct({
  generatedAt: Schema.String,
  events: Schema.Array(EventSchema),
});

export type EventsPayload = Schema.Schema.Type<typeof PayloadSchema>;

/** Boundary validation (AC-1.1) — an Effect failing on shape mismatch. */
export const decodeEventsPayload = Schema.decodeUnknown(PayloadSchema);
