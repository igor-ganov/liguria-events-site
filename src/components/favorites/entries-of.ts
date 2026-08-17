/** The entries of an unknown value when it is an object, else none. */
export const entriesOf = (value: unknown): readonly (readonly [string, unknown])[] =>
  [value]
    .filter((v): v is object => Boolean(v) && typeof v === 'object')
    .flatMap((v) => Object.entries(v));
