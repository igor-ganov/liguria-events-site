import { commonsImg } from '../../lib/img/commons-img.ts';
import { inViewRegions } from './in-view-regions.ts';
import { loadPlaces } from '../../lib/places/load-places.ts';
import { mapState } from './map-state.ts';
import { openPopup } from './open-popup.ts';
import { placeCard } from './place-card.ts';
import { placeColor } from '../../lib/places/place-color.ts';
import { placeIcon } from '../../lib/places/place-icon.ts';
import { placePopupHtml } from '../../lib/map/place-popup-html.ts';
import { placesVisible } from '../../lib/map/places-visible.ts';
import { poiLayer } from './poi-layer.ts';
import { poiMarkerEl } from './poi-marker-el.ts';
import { warmImage } from './warm-image.ts';
import type { MapContext } from './map-context.ts';
import type { Place } from '../../lib/places/place-schema.ts';
import type { PoiLayer } from './poi-layer-spec.ts';
import type { PopupOptions } from 'maplibre-gl';

const POPUP: PopupOptions = {
  closeButton: false,
  maxWidth: '264px',
  anchor: 'bottom',
  offset: 22,
  className: 'lm-popup',
};
/** Photo width a marker's little squircle face asks Commons for. */
const FACE_PX = 96;
// Places are dense venues (all-Italy is ~100 MB and an unreadable blob), so
// they load only while the viewport is focused on a few regions. The ceiling is
// a region COUNT, not a raw zoom, so a single southern region loads its places
// exactly like a northern one does.
const MAX_REGIONS = 5;

/** The places layer: squircle markers, distinct from the square events and the
 *  round landmarks. Most places have no photo, so the category icon is the norm. */
export const placesLayer = (context: MapContext): PoiLayer => {
  const card = placeCard(context.lang, context.ui);
  const popup = openPopup(context.map);
  const markerEl = (place: Place): HTMLElement => {
    warmImage(card(place).image);
    return poiMarkerEl({
      prefix: 'pl',
      variable: '--pl',
      color: placeColor(place.cat),
      icon: placeIcon(place.cat, 18),
      image: place.img && commonsImg(place.img, FACE_PX),
    });
  };
  return poiLayer<Place>({
    face: {
      map: context.map,
      prefix: 'pl',
      anchor: 'center',
      // Gates the draw AND, through poiLayer, the shard fetch — see
      // places-visible.ts for why the region cap alone was not enough.
      visible: () => placesVisible(mapState.showPlaces, context.map.getZoom()),
      markerEl,
      openPoint: (place, at) => popup(POPUP)(placePopupHtml(card(place)), at),
    },
    radius: 58,
    maxZoom: 17,
    cap: MAX_REGIONS,
    home: context.region,
    inView: () => inViewRegions(context.map),
    load: (region) => loadPlaces(region, context.lang),
    // Switched on too far out — either below the zoom threshold or over half
    // the country, where only the home region's shard would load — say so
    // rather than leave the map looking broken.
    onShow: () =>
      [0]
        .filter(
          () =>
            !placesVisible(true, context.map.getZoom()) ||
            inViewRegions(context.map).length > MAX_REGIONS,
        )
        .forEach(() => context.say('zoomIn')),
  });
};
