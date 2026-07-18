import { Either, Schema } from 'effect';
import { LandmarkSchema } from './landmark-schema.ts';
import type { Landmark } from './landmark-schema.ts';

const decode = Schema.decodeUnknownEither(Schema.Array(LandmarkSchema));

/** Decode an unknown value into a Landmark list; malformed → empty. */
export const decodeLandmarks = (value: unknown): readonly Landmark[] =>
  Either.getOrElse(decode(value), () => []);
