import { when } from './when.ts';

/** The "open this leg in Google Maps" link, empty when the leg carries no URL. */
export const mapsLink = (mapsUrl: string): string =>
  when(
    mapsUrl !== '',
    ` <a href="${mapsUrl}" target="_blank" rel="noopener">Google&nbsp;Maps ↗</a>`,
  );
