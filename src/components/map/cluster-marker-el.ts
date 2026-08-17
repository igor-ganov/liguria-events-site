import { clusterFaceHtml } from '../../lib/map/cluster-face-html.ts';

/** The plaque standing for the points a layer collapsed at this zoom. Each
 *  layer keeps its own shape in CSS through its class stem. */
export const clusterMarkerEl =
  (prefix: string) =>
  (count: number): HTMLElement => {
    const el = document.createElement('div');
    el.className = `${prefix}-marker ${prefix}-cluster`;
    el.innerHTML = clusterFaceHtml(prefix)(count);
    return el;
  };
