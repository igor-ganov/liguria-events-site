/** Read a string field off a parsed JSON body without a cast: Object(x) === x
 *  is true only for real objects, so Reflect.get is safe past the guard. Own
 *  properties only — an inherited member (`constructor`, `toString`) is not a
 *  field — and anything that is not a string reads as nothing. */
export const jsonField = (body: unknown, key: string): string | undefined =>
  [body]
    .filter((value) => Object(value) === value)
    .filter((value) => Object.hasOwn(Object(value), key))
    .map((value) => Reflect.get(Object(value), key))
    .filter((value): value is string => typeof value === 'string')
    .at(0);
