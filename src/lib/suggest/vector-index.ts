/** The semantic index as the worker holds it: one int8 row per document, in
 *  the order of `ids`, with each row's region, last day and length. */
export type VectorIndex = Readonly<{
  dims: number;
  ids: readonly string[];
  regions: readonly string[];
  until: readonly string[];
  vectors: Int8Array;
  norms: Float32Array;
}>;

/** One document the query came close to, and how close (cosine). */
export type Match = Readonly<{ id: string; score: number }>;
