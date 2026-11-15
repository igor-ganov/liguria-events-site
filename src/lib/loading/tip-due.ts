/** Whether a load that has lasted `elapsedMs` has earned a tip. */
export const tipDue =
  (thresholdMs: number) =>
  (elapsedMs: number): boolean =>
    elapsedMs >= thresholdMs;
