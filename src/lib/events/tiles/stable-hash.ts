const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

// FNV-1a alone orders strings that differ only in their last letters almost
// the same way whatever comes before; murmur's finaliser scatters them.
const mix = (hash: number): number =>
  [16, 13, 16].reduce(
    (value, shift, step) => Math.imul(value ^ (value >>> shift), [0x85ebca6b, 0xc2b2ae35, 1][step] ?? 1) >>> 0,
    hash,
  );

/** A small, stable 32-bit hash of a string: the same text gives the same
 *  number on every build and every machine, which is all an order that has
 *  to look shuffled but never change needs. */
export const stableHash = (text: string): number =>
  mix([...text].reduce((hash, char) => Math.imul(hash ^ (char.codePointAt(0) ?? 0), FNV_PRIME) >>> 0, FNV_OFFSET));
