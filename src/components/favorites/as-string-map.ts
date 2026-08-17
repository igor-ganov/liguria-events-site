import { entriesOf } from './entries-of.ts';

const isStringEntry = (entry: readonly [string, unknown]): entry is readonly [string, string] =>
  typeof entry[1] === 'string';

/** A stored id → time map (pinned start times), keeping only string values. */
export const asStringMap = (raw: unknown): Readonly<Record<string, string>> =>
  Object.fromEntries(entriesOf(raw).filter(isStringEntry));
