const isString = (value: unknown): value is string => typeof value === 'string';

/** The page stamps its region on the global scope; a page that does not is
 *  Liguria, the founding region. */
export const currentRegion = (): string =>
  [Reflect.get(globalThis, '__REGION__')].filter(isString)[0] ?? 'liguria';
