import { fieldOf } from './field-of.ts';
import { isString } from './is-string.ts';

/** A stored route's display name, falling back to its id. */
export const routeNameOf = (raw: unknown, id: string): string =>
  [fieldOf(raw, 'name')].filter(isString).at(0) ?? id;
