/**
 * What a page is allowed to cost.
 *
 * Partial on purpose. A metric that is not named is not judged, because not
 * every metric means something in every setting: layout shift under an
 * artificially throttled connection is a real property of the page, while the
 * largest paint in the same run is mostly a measurement of how busy the
 * machine running the test is. Naming a metric you cannot hold the product to
 * is how a suite teaches people to ignore it.
 */
export type Budget = Readonly<{ cls?: number; lcpMs?: number; biggestJsKb?: number }>;

/** What it actually cost. A metric the page could not produce is absent, and
 *  absent is never a pass — that is how a page that never painted scores well. */
export type Metrics = Readonly<{
  cls: number | undefined;
  lcpMs: number | undefined;
  biggestJsKb: number | undefined;
}>;
