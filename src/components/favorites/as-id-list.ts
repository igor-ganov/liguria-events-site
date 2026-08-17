import { asArray } from './as-array.ts';
import { isString } from './is-string.ts';

/** An unknown (JSON-parsed) value as a list of ids — anything non-string drops. */
export const asIdList = (raw: unknown): readonly string[] => asArray(raw).filter(isString);
