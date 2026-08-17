import { asPoint } from './as-point.ts';
import { GLOBAL_BASE_KEY } from './global-base-key.ts';
import type { Point } from './point-types.ts';

/** The trip-wide default base, or nothing when unset, unreadable or blocked. */
export const readGlobalBase = (): Point | undefined => {
  try {
    return asPoint(JSON.parse(localStorage.getItem(GLOBAL_BASE_KEY) ?? '0'));
  } catch {
    return undefined;
  }
};
