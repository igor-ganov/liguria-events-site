import { regionOf } from './region-of.ts';
import type { CompactEvent } from '../events/event-schema.ts';

/** Each (region, city) that has at least one event — the places whose facet
 *  pages can be worth advertising. */
export const citiesWithEvents = (
  events: readonly CompactEvent[],
): readonly Readonly<{ region: string; city: string }>[] => {
  const keys = new Set(
    events.filter((event) => (event.ct ?? '') !== '').map((event) => `${regionOf(event)}/${event.ct ?? ''}`),
  );
  return [...keys].map((key) => {
    const [region = '', city = ''] = key.split('/');
    return { region, city };
  });
};
