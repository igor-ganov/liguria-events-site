import type Supercluster from 'supercluster';
import { categoryColor } from '../../lib/events/category-color.ts';
import { clusterPopupHtml } from '../../lib/map/cluster-popup-html.ts';
import { drawLayer } from './draw-layer.ts';
import { eventCard } from './event-card.ts';
import { eventPoint } from '../../lib/map/event-point.ts';
import { eventPopupHtml } from '../../lib/map/event-popup-html.ts';
import { iconSvg } from '../../lib/icons/icon-svg.ts';
import { loadedIndex } from '../../lib/map/loaded-index.ts';
import { mapState } from './map-state.ts';
import { openPopup } from './open-popup.ts';
import { pointFeatures } from '../../lib/map/point-features.ts';
import { poiMarkerEl } from './poi-marker-el.ts';
import { primaryCategory } from '../../lib/events/primary-category.ts';
import { shownEvents } from './shown-events.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';
import type { MapContext } from './map-context.ts';
import type { Marker, PopupOptions } from 'maplibre-gl';
import type { Payload } from '../../lib/map/payload.ts';

const CARD: PopupOptions = { closeButton: false, maxWidth: '260px', anchor: 'bottom', offset: 26 };
const LIST: PopupOptions = {
  closeButton: true,
  maxWidth: '300px',
  anchor: 'bottom',
  offset: 26,
  className: 'map-clus-popup',
};

/** The events layer as the rest of the page uses it. */
export type EventsLayer = Readonly<{ draw: () => void; rebuild: () => void }>;

const markerEl = (event: CompactEvent): HTMLElement =>
  poiMarkerEl({
    prefix: 'ev',
    variable: '--c',
    color: categoryColor(primaryCategory(event.c)),
    icon: iconSvg(primaryCategory(event.c), 22),
    image: event.img,
  });

/** The events layer: square photo markers over the whole country's events,
 *  filtered by the toolbar. Clicking a cluster LISTS what collapsed into it —
 *  what matters about an event is which one it is, not where exactly. */
export const eventsLayer = (context: MapContext): EventsLayer => {
  const markers: Marker[] = [];
  const card = eventCard(context.lang);
  const popup = openPopup(context.map);
  let index: Supercluster<Payload<CompactEvent>> | undefined;
  const leaves = (clusterId: number): readonly CompactEvent[] =>
    (index?.getLeaves(clusterId, Infinity) ?? []).map((leaf) => leaf.properties.item);
  const draw = (): void =>
    drawLayer<CompactEvent>({
      map: context.map,
      prefix: 'ev',
      anchor: 'bottom',
      index,
      markers,
      visible: () => mapState.showEvents,
      markerEl,
      openPoint: (event, at) => popup(CARD)(eventPopupHtml(card(event)), at),
      openCluster: (clusterId, at) => popup(LIST)(clusterPopupHtml(leaves(clusterId).map(card)), at),
    });
  const rebuild = (): void => {
    index = loadedIndex(60, 15)(
      pointFeatures<CompactEvent>(eventPoint)<Payload<CompactEvent>>((item) => ({ item }))(
        shownEvents(context.events),
      ),
    );
  };
  return { draw, rebuild };
};
