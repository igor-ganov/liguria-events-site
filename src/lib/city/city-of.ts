import { DEFAULT_CITY } from './default-city.ts';
import type { CompactEvent } from '../events/event-schema.ts';

/** The city an event is filed under. An event collected before the city
 *  dimension existed belongs to the city the platform started in, rather than
 *  vanishing from every page. */
export const cityOf = (event: CompactEvent): string => event.ct ?? DEFAULT_CITY;
