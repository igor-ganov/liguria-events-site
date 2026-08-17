import { asIdList } from './as-id-list.ts';
import { entriesOf } from './entries-of.ts';

/** The stored per-day custom stop order: day → ids. Days whose value is not a
 *  list drop out entirely, so a corrupted entry cannot reorder a day. */
export const asIdLists = (raw: unknown): Readonly<Record<string, readonly string[]>> =>
  Object.fromEntries(
    entriesOf(raw)
      .filter(([, ids]) => Array.isArray(ids))
      .map(([day, ids]): readonly [string, readonly string[]] => [day, asIdList(ids)]),
  );
