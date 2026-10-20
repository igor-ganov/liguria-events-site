import { REGION_KEY } from './region-key.ts';

/** The region the reader last looked at, as their browser remembers it.
 *  Storage throws in a private window and where site data is blocked, and a
 *  front door that cannot read it simply asks. */
export const readRegion = (): string | undefined => {
  try {
    return localStorage.getItem(REGION_KEY) ?? undefined;
  } catch {
    return undefined;
  }
};
