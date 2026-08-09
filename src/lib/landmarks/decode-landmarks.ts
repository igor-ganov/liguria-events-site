import { Either, Schema } from 'effect';
import { LandmarkSchema } from './landmark-schema.ts';
import type { Landmark } from './landmark-schema.ts';
import { isJunkImage } from '../img/is-junk-image.ts';

const decode = Schema.decodeUnknownEither(Schema.Array(LandmarkSchema));

// Inject `region` (it is the filename, not stored per-row) and drop an image
// that is an infobox map/flag/crest rather than a photo — belt-and-braces on
// top of the build-time filter, so even a stale shard never shows one.
const clean = (r: unknown, region: string): unknown => {
  const base = Object(r) === r ? Object(r) : {};
  const img = Reflect.get(base, 'img');
  return isJunkImage(typeof img === 'string' ? img : undefined)
    ? { ...base, region, img: undefined }
    : { ...base, region };
};

/** Decode a region's shard into a Landmark list; malformed → empty. */
export const decodeLandmarks = (value: unknown, region: string): readonly Landmark[] => {
  const rows = Array.isArray(value) ? value.map((r: unknown) => clean(r, region)) : value;
  return Either.getOrElse(decode(rows), () => []);
};
