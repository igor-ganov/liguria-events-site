import { clusterFaceHtml } from '../../lib/map/cluster-face-html.ts';

/** The plaque standing for the points a layer collapsed at this zoom. Each
 *  layer keeps its own shape in CSS through its class stem. It is named by the
 *  number written on it: left unnamed, the map library calls every marker
 *  "Map marker", which is not what anyone looking at it would ask for. */
export const clusterMarkerEl =
  (prefix: string) =>
  (count: number): HTMLElement => {
    const el = document.createElement('div');
    el.className = `${prefix}-marker ${prefix}-cluster`;
    el.innerHTML = clusterFaceHtml(prefix)(count);
    el.setAttribute('aria-label', String(count));
    return el;
  };
