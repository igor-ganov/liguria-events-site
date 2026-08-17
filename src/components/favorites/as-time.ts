import { isString } from './is-string.ts';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** A stored HH:MM clock time; '' when absent or malformed. */
export const asTime = (value: unknown): string =>
  [value].filter(isString).filter((text) => TIME_RE.test(text)).at(0) ?? '';
