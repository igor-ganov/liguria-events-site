import { isFavId } from './is-fav-id.ts';

const MAX = 500;

/** The favourite ids carried by a sync payload: anything that is not an array
 *  reads as empty, entries that are not ids are dropped, and the list is capped
 *  so one request cannot merge an unbounded set. */
export const favIdList = (value: unknown): readonly string[] =>
  [value]
    .filter((candidate): candidate is readonly unknown[] => Array.isArray(candidate))
    .map((list) => list.filter(isFavId).slice(0, MAX))
    .at(0) ?? [];
