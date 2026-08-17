/** Narrow parsed JSON to something with entries. `Object(v) === v` is true for
 *  objects and arrays and false for every primitive — the branch-free stand-in
 *  for `v && typeof v === 'object'`. */
export const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  Object(value) === value;
