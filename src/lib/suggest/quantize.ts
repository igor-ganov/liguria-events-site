/**
 * A float vector as int8, its largest component at ±127. Only the direction
 * matters for a cosine, so each vector gets its own scale and none is stored:
 * a 1024-dimension bge-m3 vector shrinks from 4 KB to 1 KB with a ranking
 * error far below the gap between a match and a miss.
 */
export const quantize = (vector: readonly number[]): Int8Array => {
  const peak = vector.reduce((max, value) => Math.max(max, Math.abs(value)), 0);
  const scale = 127 / (peak || 1);
  return Int8Array.from(vector, (value) => Math.round(value * scale));
};
