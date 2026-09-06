/** What the bar adds to the age it is already showing, once the worker has
 *  reported what it found behind the page. */
export type FreshnessOver = Readonly<{ updated: boolean; offline: boolean }>;

const SILENT: FreshnessOver = { updated: false, offline: false };

const OVER: Readonly<Record<string, FreshnessOver | undefined>> = {
  fresh: { updated: true, offline: false },
  // Reached the site and it holds the same page: nothing to offer and nothing
  // to warn about. Saying "no connection" here would be a lie told to a reader
  // who has one.
  same: SILENT,
  offline: { updated: false, offline: true },
};

export const freshnessOver = (kind: string): FreshnessOver => OVER[kind] ?? SILENT;
