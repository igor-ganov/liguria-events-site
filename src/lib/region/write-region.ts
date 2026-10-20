import { REGION_KEY } from './region-key.ts';

/** Remember a region. Storage throws for the same reasons reading does, and
 *  forgetting where somebody was is not worth a broken page — the next visit
 *  asks again, which is the honest answer. */
export const writeRegion = (slug: string): void => {
  try {
    localStorage.setItem(REGION_KEY, slug);
  } catch {
    // Nothing to do.
  }
};
