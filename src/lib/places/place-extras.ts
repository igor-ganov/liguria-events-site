import { isJunkImage } from '../img/is-junk-image.ts';
import type { PlaceRow } from './place-row.ts';
import type { Place } from './place-schema.ts';

/** Everything on a Place beyond the fields every row must carry. */
export type PlaceExtras = Omit<Place, 'id' | 'name' | 'cat' | 'lat' | 'lng' | 'region'>;

// A field is either present (a 1-element list, spread into the result) or
// absent (an empty list → `{}`), so an empty string never becomes a key.
const text = (value: string | undefined): readonly string[] =>
  [value].filter((candidate): candidate is string => Boolean(candidate));

const list = (value: readonly string[] | undefined): readonly (readonly string[])[] =>
  [value].filter((candidate): candidate is readonly string[] => Array.isArray(candidate) && candidate.length > 0);

// Belt-and-braces on top of the build-time filter: an infobox map/flag/crest is
// not a photo, so a stale shard never shows one.
const photo = (value: string | undefined): readonly string[] =>
  text(value).filter((img) => !isJunkImage(img));

/** Expand a compact row's optional fields, omitting every absent one. */
export const placeExtras = (r: PlaceRow): PlaceExtras => ({
  ...(text(r.w).map((website) => ({ website })).at(0) ?? {}),
  ...(text(r.d).map((desc) => ({ desc })).at(0) ?? {}),
  ...(text(r.h).map((hours) => ({ hours })).at(0) ?? {}),
  ...(text(r.p).map((phone) => ({ phone })).at(0) ?? {}),
  ...(list(r.so).map((socials) => ({ socials })).at(0) ?? {}),
  ...(text(r.ad).map((address) => ({ address })).at(0) ?? {}),
  ...(text(r.k).map((wiki) => ({ wiki })).at(0) ?? {}),
  ...(text(r.q).map((wd) => ({ wd })).at(0) ?? {}),
  ...(photo(r.m).map((img) => ({ img })).at(0) ?? {}),
});
