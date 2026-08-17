/** A copy of the record without one key — the branch-free stand-in for
 *  `const next = { ...record }; delete next[key];`. */
export const omitKey = <T>(
  record: Readonly<Record<string, T>>,
  key: string,
): Readonly<Record<string, T>> =>
  Object.fromEntries(Object.entries(record).filter(([name]) => name !== key));
