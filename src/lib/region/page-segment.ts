/**
 * The sub-page the region picker must keep you on. `path` is "<region>/",
 * "<region>/calendar/2026-07/" or "<region>/map/" — the part after the region is
 * the page. A specific month collapses to the calendar index: another region may
 * have no events that month and therefore no page for it.
 *
 * On a city page (path = "<region>/<city>/") the second segment is the city, not
 * a sub-page — switching region then goes to that region's feed, not to a
 * non-existent /<region>/<city>/.
 */
export const pageSegment = (path: string, city: string | undefined): string =>
  [city]
    .filter((named) => named === undefined)
    .flatMap(() =>
      path
        .split('/')
        .slice(1)
        .filter((part) => part !== '')
        .slice(0, 1),
    )
    .map((part) => `${part}/`)[0] ?? '';
