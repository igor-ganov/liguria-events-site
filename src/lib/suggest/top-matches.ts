import type { Match, VectorIndex } from './vector-index.ts';

const dot = (row: Int8Array, query: Float32Array): number => row.reduce((sum, value, at) => sum + value * (query[at] ?? 0), 0);

/**
 * The rows closest in meaning to a query vector, best first. A brute-force
 * scan: ~1.8k rows of 1024 int8 take a few milliseconds in a worker, less
 * than a round trip to a vector database would, and need no index service.
 */
export const topMatches = (
  index: VectorIndex,
  query: readonly number[],
  keep: (row: number) => boolean,
  limit: number,
): readonly Match[] => {
  const near = Float32Array.from(query);
  const length = Math.sqrt(near.reduce((sum, value) => sum + value * value, 0)) || 1;
  return index.ids
    .map((id, row) => ({ id, row }))
    .filter(({ row }) => keep(row))
    .map(({ id, row }) => ({
      id,
      score: dot(index.vectors.subarray(row * index.dims, row * index.dims + index.dims), near) / ((index.norms[row] || 1) * length),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};
