import { clusterRowHtml } from './cluster-row-html.ts';
import type { ClusterRow } from './cluster-row-html.ts';

/**
 * The popup a cluster plaque opens: a count header over the list of the events
 * that collapsed into it. The header is the row count, so it always matches the
 * list below it.
 */
export const clusterPopupHtml = (rows: readonly ClusterRow[]): string =>
  `<div class="map-clus-card"><div class="map-clus-head">${rows.length}</div>` +
  `<div class="map-clus-list">${rows.map(clusterRowHtml).join('')}</div></div>`;
