import { commonsImg } from '../../lib/img/commons-img.ts';
import { inViewRegions } from './in-view-regions.ts';
import { landmarkCard } from './landmark-card.ts';
import { landmarkColor } from '../../lib/landmarks/landmark-color.ts';
import { landmarkIcon } from '../../lib/landmarks/landmark-icon.ts';
import { landmarkPopupHtml } from '../../lib/map/landmark-popup-html.ts';
import { loadLandmarks } from '../../lib/landmarks/load-landmarks.ts';
import { mapState } from './map-state.ts';
import { openPopup } from './open-popup.ts';
import { poiLayer } from './poi-layer.ts';
import { poiMarkerEl } from './poi-marker-el.ts';
import { warmImage } from './warm-image.ts';
import type { Landmark } from '../../lib/landmarks/landmark-schema.ts';
import type { MapContext } from './map-context.ts';
import type { PoiLayer } from './poi-layer-spec.ts';
import type { PopupOptions } from 'maplibre-gl';

const POPUP: PopupOptions = {
  closeButton: false,
  maxWidth: '264px',
  anchor: 'bottom',
  offset: 24,
  className: 'lm-popup',
};
/** Photo width a marker's little round face asks Commons for. */
const FACE_PX = 96;

/**
 * The landmarks layer: an opt-in set of ROUND photo markers, so the heritage
 * layer reads distinctly from the square event markers. Landmarks are notable
 * and few, so EVERY in-view region loads at any zoom — heritage shows across the
 * whole country, south included, whatever the camera is doing.
 */
export const landmarksLayer = (context: MapContext): PoiLayer => {
  const card = landmarkCard(context.lang, context.ui);
  const popup = openPopup(context.map);
  const markerEl = (landmark: Landmark): HTMLElement => {
    // Warm the exact URL the card will ask for, so a click opens on the photo.
    warmImage(card(landmark).image);
    return poiMarkerEl({
      prefix: 'lm',
      variable: '--lm',
      color: landmarkColor(landmark.kind),
      icon: landmarkIcon(landmark.kind, 20),
      image: landmark.img && commonsImg(landmark.img, FACE_PX),
    });
  };
  return poiLayer<Landmark>({
    face: {
      map: context.map,
      prefix: 'lm',
      anchor: 'center',
      visible: () => mapState.showLandmarks,
      markerEl,
      openPoint: (landmark, at) => popup(POPUP)(landmarkPopupHtml(card(landmark)), at),
    },
    radius: 60,
    maxZoom: 16,
    cap: Infinity,
    home: context.region,
    inView: () => inViewRegions(context.map),
    load: (region) => loadLandmarks(region, context.lang),
    onShow: () => undefined,
  });
};
