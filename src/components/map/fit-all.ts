import maplibregl from 'maplibre-gl';
import { corePoints } from '../../lib/map/core-points.ts';
import { eventPoint } from '../../lib/map/event-point.ts';
import { homeRegionEvents } from '../../lib/map/home-region-events.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { shownEvents } from './shown-events.ts';
import type { MapCameraView } from '../../lib/map/read-view.ts';
import type { MapContext } from './map-context.ts';

/**
 * Open on the region named in the URL while still holding the whole country:
 * pan or zoom out and every other region's pins are already in the layer.
 * corePoints() drops the mis-geocoded outliers that used to drag the opening
 * view across half of Italy. A camera carried in from the URL is the one the
 * visitor left, so fitting over it would throw their view away.
 */
export const fitAll = (context: MapContext, saved: MapCameraView | undefined): void => {
  const visible = shownEvents(context.events).filter((event) => eventPoint(event) !== undefined);
  const located = homeRegionEvents(context.region)(visible).map(eventPoint).filter(isDefined);
  [located]
    .filter(() => saved === undefined)
    .filter((points) => points.length > 0)
    .forEach((points) => {
      const bounds = new maplibregl.LngLatBounds();
      corePoints(points).forEach((point) => bounds.extend([point[0], point[1]]));
      context.map.fitBounds(bounds, { padding: 60, maxZoom: 13, duration: 0 });
    });
};
