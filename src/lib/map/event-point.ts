import { isDefined } from '../is-defined.ts';
import type { CompactEvent } from '../events/event-schema.ts';

/**
 * An event's map coordinate as [lng, lat] — the order GeoJSON and maplibre
 * want, while the compact event stores `g` as [lat, lng]. Undefined when the
 * event was never geocoded, which is what keeps it out of the marker layer.
 */
export const eventPoint = (event: CompactEvent): readonly [number, number] | undefined =>
  [event.g]
    .filter(isDefined)
    .map((g): readonly [number, number] => [g[1], g[0]])
    .at(0);
