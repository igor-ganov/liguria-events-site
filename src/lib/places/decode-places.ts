import { PLACE_CATEGORIES } from './place-categories.ts';
import type { PlaceCategory } from './place-categories.ts';
import type { Place } from './place-schema.ts';

// The asset is compact rows (short keys, absent fields omitted) — see
// scripts/build-places.ts. Expand into readable Place objects; region is always
// liguria, so it is not carried per-row.
type Row = { i: string; n: string; c: string; a: number; o: number; w?: string; d?: string; h?: string; r?: number; k?: string; q?: string; m?: string };
const CATS = new Set<string>(PLACE_CATEGORIES);

const toPlace = (region: string) => (r: Row): Place[] =>
  typeof r?.i === 'string' && typeof r.n === 'string' && CATS.has(r.c) && typeof r.a === 'number' && typeof r.o === 'number'
    ? [{
        id: r.i, name: r.n, cat: r.c as PlaceCategory, lat: r.a, lng: r.o, region,
        ...(r.w ? { website: r.w } : {}),
        ...(r.d ? { desc: r.d } : {}),
        ...(r.h ? { hours: r.h } : {}),
        ...(typeof r.r === 'number' ? { rating: r.r } : {}),
        ...(r.k ? { wiki: r.k } : {}),
        ...(r.q ? { wd: r.q } : {}),
        ...(r.m ? { img: r.m } : {}),
      }]
    : [];

/** Decode a region's compact shard into Place objects; malformed → dropped.
 *  Rows omit `region` (it IS the shard filename), so it is supplied here. */
export const decodePlaces = (value: unknown, region: string): readonly Place[] =>
  Array.isArray(value) ? (value as Row[]).flatMap(toPlace(region)) : [];
