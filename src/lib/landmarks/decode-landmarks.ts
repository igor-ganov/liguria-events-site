import { Either, Schema } from 'effect';
import { LandmarkSchema } from './landmark-schema.ts';
import type { Landmark } from './landmark-schema.ts';

const decode = Schema.decodeUnknownEither(Schema.Array(LandmarkSchema));

/** Decode a region's shard into a Landmark list; malformed → empty. The shard
 *  rows omit `region` (it IS the filename), so it is injected here. */
export const decodeLandmarks = (value: unknown, region: string): readonly Landmark[] => {
  const rows = Array.isArray(value) ? value.map((r: unknown) => ({ ...(r as object), region })) : value;
  return Either.getOrElse(decode(rows), () => []);
};
