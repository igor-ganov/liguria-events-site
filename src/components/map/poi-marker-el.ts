import { photoMarkerHtml } from '../../lib/map/photo-marker-html.ts';

/** The face of one map marker: which layer it belongs to (`ev` square events,
 *  `lm` round landmarks, `pl` squircle places), the CSS variable that layer
 *  tints itself through, and the picture or icon to show. */
export type MarkerFace = Readonly<{
  prefix: string;
  variable: string;
  color: string;
  icon: string;
  image: string | undefined;
}>;

/** The DOM shell a marker's tested markup is mounted in. */
export const poiMarkerEl = (face: MarkerFace): HTMLElement => {
  const el = document.createElement('div');
  el.className = `${face.prefix}-marker`;
  el.style.setProperty(face.variable, face.color);
  el.innerHTML = photoMarkerHtml(face.prefix)(face.icon)(face.image);
  return el;
};
