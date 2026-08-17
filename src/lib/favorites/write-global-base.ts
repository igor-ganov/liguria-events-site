import { GLOBAL_BASE_KEY } from './global-base-key.ts';
import type { Point } from './point-types.ts';

/** Remember a base as the trip-wide default. */
export const writeGlobalBase = (point: Point): void => {
  try {
    localStorage.setItem(GLOBAL_BASE_KEY, JSON.stringify(point));
  } catch {
    /* storage blocked — ignore */
  }
};
