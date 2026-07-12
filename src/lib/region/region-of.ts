import { DEFAULT_REGION } from './default-region.ts';
import type { CompactEvent } from '../events/event-schema.ts';

/** An event collected before the region dimension existed belongs to the region
 *  the platform started in, rather than vanishing from every page. */
export const regionOf = (event: CompactEvent): string => event.rg ?? DEFAULT_REGION;
