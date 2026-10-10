type Pair = readonly [number, number];

const mix = ([low, high]: Pair, code: number): Pair => [
  Math.imul(low ^ code, 2654435761),
  Math.imul(high ^ code, 1597334677),
];

const settle = (one: number, other: number): number =>
  Math.imul(one ^ (one >>> 16), 2246822507) ^ Math.imul(other ^ (other >>> 13), 3266489909);

const hex = (word: number): string => (word >>> 0).toString(16).padStart(8, '0');

/**
 * The name a small copy of a picture is stored under: sixty-four bits of the
 * address it was taken from, as sixteen hex digits. Computed the same way by
 * the script that makes the copies and by the page that points at them, so
 * neither has to carry a table from addresses to names.
 */
export const thumbKey = (url: string): string => {
  const [low, high] = Array.from(url, (char) => char.charCodeAt(0)).reduce(mix, [0xdeadbeef, 0x41c6ce57]);
  return `${hex(settle(high, low))}${hex(settle(low, high))}`;
};
