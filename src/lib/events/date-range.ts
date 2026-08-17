import { branch } from '../branch.ts';

/** `2026-07-04` for a one-day event, `2026-07-04–2026-07-06` for a run. */
export const dateRange = (start: string, end?: string): string =>
  branch((end ?? '') !== '')(
    () => `${start}–${end}`,
    () => start,
  );
