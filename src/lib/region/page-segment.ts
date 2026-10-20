import { branch } from '../branch.ts';

/**
 * The sub-page the region picker must keep you on. `path` is "<region>/",
 * "<region>/calendar/2026-07/", "<region>/map/" — or, on a national page,
 * "calendar/2026-11/" with no region in front of it at all. A specific month
 * collapses to the calendar index: another region may have no events that month
 * and therefore no page for it.
 *
 * On a city page (path = "<region>/<city>/") the second segment is the city,
 * not a sub-page — switching region then goes to that region's feed, not to a
 * non-existent /<region>/<city>/.
 */
export const pageSegment = (path: string, city: string | undefined, region: string): string =>
  [city]
    .filter((named) => named === undefined)
    .flatMap(() =>
      branch(region === '')(
        () => path.split('/'),
        // The region is the first segment of its own pages, and it is not the
        // page; on a national page nothing is in front of the page but the
        // site itself.
        () => path.split('/').slice(1),
      )
        .filter((part) => part !== '')
        .slice(0, 1),
    )
    .map((part) => `${part}/`)[0] ?? '';
