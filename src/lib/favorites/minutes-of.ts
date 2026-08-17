const CLOCK = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Minutes-since-midnight for an `HH:MM` clock time, or undefined when absent
 *  or malformed. Exposed so the async routing enrichment can recompute a leg's
 *  `tight` flag with real travel times. */
export const minutesOf = (time: string | undefined): number | undefined =>
  [time]
    .filter((value): value is string => value !== undefined && CLOCK.test(value))
    .map((value) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3)))
    .at(0);
