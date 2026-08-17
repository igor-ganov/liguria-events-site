/** Read an own field of any shape off a parsed JSON body without a cast:
 *  Object(x) === x is true only for real objects, so Reflect.get is safe past
 *  the guard. Use this when the value's own type matters (a number, a boolean);
 *  `jsonField` is the string-only reader. */
export const jsonValue = (body: unknown, key: string): unknown =>
  [body]
    .filter((value) => Object(value) === value)
    .filter((value) => Object.hasOwn(Object(value), key))
    .map((value) => Reflect.get(Object(value), key))
    .at(0);
