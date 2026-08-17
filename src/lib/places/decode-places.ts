import { isValidPlaceRow } from './place-row.ts';
import { placeExtras } from './place-extras.ts';
import type { PlaceRow } from './place-row.ts';
import type { Place } from './place-schema.ts';

const isRows = (value: unknown): value is readonly Partial<PlaceRow>[] => Array.isArray(value);

const toPlace =
  (region: string) =>
  (r: Partial<PlaceRow>): readonly Place[] =>
    [r]
      .filter(isValidPlaceRow)
      .map((row) => ({
        id: row.i,
        name: row.n,
        cat: row.c,
        lat: row.a,
        lng: row.o,
        region,
        ...placeExtras(row),
      }));

/** Decode a region's compact shard into Place objects; malformed → dropped.
 *  Rows omit `region` (it IS the shard filename), so it is supplied here. */
export const decodePlaces = (value: unknown, region: string): readonly Place[] =>
  [value].filter(isRows).flatMap((rows) => rows.flatMap(toPlace(region)));
