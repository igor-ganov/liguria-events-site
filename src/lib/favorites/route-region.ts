import { REGION_GEO } from '../region/region-bounds.ts';

/** The region a saved route belongs to; anything unknown falls back to Liguria. */
export const routeRegion = (value: unknown): string =>
  [value]
    .filter((candidate): candidate is string => typeof candidate === 'string')
    .filter((name) => name in REGION_GEO)
    .at(0) ?? 'liguria';
