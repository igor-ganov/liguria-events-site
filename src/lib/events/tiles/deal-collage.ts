/**
 * The pool dealt out to the tiles in order, a full hand each: a tile whose
 * hand cannot be filled stays plain colour rather than half dressed.
 */
export const dealCollage = (pool: readonly string[], sizes: readonly number[]): readonly (readonly string[])[] =>
  sizes.map((size, index) => {
    const from = sizes.slice(0, index).reduce((sum, one) => sum + one, 0);
    return pool.slice(from, from + size).filter(() => pool.length >= from + size);
  });
