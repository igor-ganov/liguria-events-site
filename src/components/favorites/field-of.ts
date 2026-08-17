import { isRecord } from './is-record.ts';

/** Read one property off an unknown (JSON-parsed) value, without trusting it to
 *  be an object. */
export const fieldOf = (raw: unknown, key: string): unknown =>
  [raw].filter(isRecord).map((record) => Reflect.get(record, key)).at(0);
