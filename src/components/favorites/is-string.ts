/** Narrow an unknown value to a string — for filtering untrusted JSON lists. */
export const isString = (value: unknown): value is string => typeof value === 'string';
