import { Either, Schema } from 'effect';
import { EventSchema } from './event-schema.ts';
import type { CompactEvent } from './event-schema.ts';

const decode = Schema.decodeUnknownEither(Schema.Array(EventSchema));

/** Decode an unknown value into a CompactEvent list; malformed → empty. */
export const decodeEventList = (value: unknown): readonly CompactEvent[] =>
  Either.getOrElse(decode(value), () => []);
