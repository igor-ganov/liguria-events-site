import { civicLayer } from './civic-layer.ts';
import { eventsLayer } from './events-layer.ts';
import { landmarksLayer } from './landmarks-layer.ts';
import { placesLayer } from './places-layer.ts';
import type { CivicLayer } from './civic-layer.ts';
import type { EventsLayer } from './events-layer.ts';
import type { MapContext } from './map-context.ts';
import type { PoiLayer } from './poi-layer-spec.ts';

/** Everything drawn over the basemap. */
export type MapLayers = Readonly<{
  events: EventsLayer;
  landmarks: PoiLayer;
  places: PoiLayer;
  civics: CivicLayer;
}>;

/** Build the four layers of the map. Nothing is drawn yet — each waits for the
 *  map's own load event, and the two opt-in ones also for their toggle. */
export const mapLayers = (context: MapContext): MapLayers => ({
  events: eventsLayer(context),
  landmarks: landmarksLayer(context),
  places: placesLayer(context),
  civics: civicLayer(context.map),
});
