import { entriesOf } from './entries-of.ts';

const isNumberEntry = (entry: readonly [string, unknown]): entry is readonly [string, number] =>
  typeof entry[1] === 'number';

/** A stored id → minutes map (durations, pauses), keeping only numeric values. */
export const asNumberMap = (raw: unknown): Readonly<Record<string, number>> =>
  Object.fromEntries(entriesOf(raw).filter(isNumberEntry));
