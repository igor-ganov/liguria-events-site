import { asArray } from './as-array.ts';
import { fieldOf } from './field-of.ts';
import { isString } from './is-string.ts';
import type { DayGroup } from '../../lib/favorites/build-route.ts';

/** The stored day → ordered ids arrangement; entries without a day string or an
 *  ids array are dropped. */
export const asGroups = (raw: unknown): readonly DayGroup[] =>
  asArray(raw).flatMap((entry) =>
    [fieldOf(entry, 'day')]
      .filter(isString)
      .filter(() => Array.isArray(fieldOf(entry, 'ids')))
      .map((day): DayGroup => ({ day, ids: asArray(fieldOf(entry, 'ids')).filter(isString) })),
  );
