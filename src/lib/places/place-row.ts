import { PLACE_CATEGORIES } from './place-categories.ts';
import type { PlaceCategory } from './place-categories.ts';

// The asset is compact rows (short keys, absent fields omitted) — see
// scripts/build-places.ts. `region` is always the shard's own, so it is not
// carried per-row.
export type PlaceRow = {
  i: string; n: string; c: string; a: number; o: number;
  w?: string; d?: string; h?: string; p?: string; so?: readonly string[];
  ad?: string; k?: string; q?: string; m?: string;
};

/** A row that carries every field a Place needs, with a known category — the
 *  narrowed shape the expansion can build from without a cast. */
export type ValidPlaceRow = PlaceRow & { c: PlaceCategory };

const CATS = new Set<string>(PLACE_CATEGORIES);

const isCategory = (value: string | undefined): value is PlaceCategory =>
  value !== undefined && CATS.has(value);

/** Whether a decoded row is complete enough to become a Place. The shard is
 *  untrusted input, so every field is treated as possibly absent. */
export const isValidPlaceRow = (r: Partial<PlaceRow>): r is ValidPlaceRow =>
  typeof r?.i === 'string' &&
  typeof r.n === 'string' &&
  isCategory(r.c) &&
  typeof r.a === 'number' &&
  typeof r.o === 'number';
