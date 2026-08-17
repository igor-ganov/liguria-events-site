/** Compare two equal-length strings without leaking where they first differ:
 *  every position is XOR-ed and the differences OR-ed together, so the work done
 *  never depends on the input. Callers must check the lengths first. */
export const equalConstantTime = (a: string, b: string): boolean =>
  Array.from({ length: a.length }, (_, i) => a.charCodeAt(i) ^ b.charCodeAt(i)).reduce(
    (diff, x) => diff | x,
    0,
  ) === 0;
