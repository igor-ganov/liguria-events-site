import { externalMark } from './external-mark.ts';
import { when } from './when.ts';

/** The "open this leg in Google Maps" link, empty when the leg carries no URL.
 *  `newTab` is what the external mark says to a screen reader. */
export const mapsLink = (mapsUrl: string, newTab: string): string =>
  when(
    mapsUrl !== '',
    ` <a href="${mapsUrl}" target="_blank" rel="noopener">Google&nbsp;Maps${externalMark(newTab)}</a>`,
  );
