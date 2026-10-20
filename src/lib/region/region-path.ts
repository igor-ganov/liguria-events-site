/**
 * A page inside a region, as an in-site path: `liguria/calendar/2026-11/`.
 *
 * No region is the same page for the whole country — `calendar/2026-11/`, with
 * no empty segment where the region used to be. Written out because
 * `${region}/${rest}` left a leading slash behind, and a canonical URL built
 * from it came out as `//calendar/`.
 */
export const regionPath = (region: string, rest = ''): string =>
  `${[region].filter((slug) => slug !== '').map((slug) => `${slug}/`).join('')}${rest}`;
