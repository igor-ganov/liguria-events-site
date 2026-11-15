const squares = (sum: number, value: number): number => sum + value * value;

/** The length of every int8 row, worked out once when the index is loaded so
 *  a query only pays for the dot products. */
export const vectorNorms = (vectors: Int8Array, dims: number): Float32Array =>
  Float32Array.from({ length: Math.floor(vectors.length / Math.max(dims, 1)) }, (_, row) =>
    Math.sqrt(vectors.subarray(row * dims, row * dims + dims).reduce(squares, 0)),
  );
