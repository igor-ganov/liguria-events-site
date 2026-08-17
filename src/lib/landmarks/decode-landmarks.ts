import { Either, Schema } from 'effect';
import { LandmarkSchema } from './landmark-schema.ts';
import type { Landmark } from './landmark-schema.ts';
import { isJunkImage } from '../img/is-junk-image.ts';

const decode = Schema.decodeUnknownEither(Schema.Array(LandmarkSchema));

const objectOf = (row: unknown): Record<string, unknown> =>
  [row]
    .filter((value) => Object(value) === value)
    .map((value) => Object(value))
    .at(0) ?? {};

const imgOf = (base: Record<string, unknown>): string | undefined =>
  [Reflect.get(base, 'img')].filter((value): value is string => typeof value === 'string').at(0);

// Blank out an image that is an infobox map/flag/crest rather than a photo, and
// leave a genuine one alone — belt-and-braces on top of the build-time filter,
// so even a stale shard never shows one.
const withoutJunkImg = (base: Record<string, unknown>): Readonly<{ img?: undefined }> =>
  [imgOf(base)]
    .filter(isJunkImage)
    .map(() => ({ img: undefined }))
    .at(0) ?? {};

// `region` is injected because it is the shard's filename, not a stored column.
const clean = (row: unknown, region: string): unknown => {
  const base = objectOf(row);
  return { ...base, region, ...withoutJunkImg(base) };
};

/** Decode a region's shard into a Landmark list; malformed → empty. */
export const decodeLandmarks = (value: unknown, region: string): readonly Landmark[] => {
  const rows =
    [value]
      .filter((candidate): candidate is readonly unknown[] => Array.isArray(candidate))
      .map((list) => list.map((row) => clean(row, region)))
      .at(0) ?? value;
  return Either.getOrElse(decode(rows), () => []);
};
