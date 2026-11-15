import { vectorNorms } from '../vector-norms.ts';
import type { VectorIndex } from '../vector-index.ts';

const strings = (value: unknown): readonly string[] | undefined =>
  [value].filter((list): list is readonly string[] => Array.isArray(list) && list.every((item) => typeof item === 'string')).at(0);

/** The index the build wrote — its id list and the int8 rows — checked once
 *  as it is read. Rows that do not add up to the ids are no index at all:
 *  a mismatch would hand one event's meaning to another. */
export const parseVectorIndex = (meta: unknown, rows: ArrayBuffer): VectorIndex | undefined => {
  const dims = Number(Reflect.get(Object(meta), 'dims'));
  const ids = strings(Reflect.get(Object(meta), 'ids')) ?? [];
  const regions = strings(Reflect.get(Object(meta), 'regions')) ?? [];
  const until = strings(Reflect.get(Object(meta), 'until')) ?? [];
  const vectors = new Int8Array(rows);
  const whole = dims > 0 && ids.length > 0 && vectors.length === ids.length * dims && regions.length === ids.length && until.length === ids.length;
  return [{ dims, ids, regions, until, vectors }]
    .filter(() => whole)
    .map((index) => ({ ...index, norms: vectorNorms(index.vectors, dims) }))
    .at(0);
};
