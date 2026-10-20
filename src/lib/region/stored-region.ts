import { REGION_NAMES } from './regions.ts';

/**
 * A region slug the browser remembered, if we still have a page for it.
 *
 * What a browser hands back is not trustworthy input: it survives a rename, it
 * can be edited by hand, and it arrives from another visit entirely. It decides
 * where a reader is sent, so it is checked against the regions that exist
 * rather than pasted into a URL.
 */
export const storedRegion = (raw: string | undefined): string | undefined =>
  [raw ?? ''].filter((slug) => Object.hasOwn(REGION_NAMES, slug)).at(0);
