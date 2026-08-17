import { escapeAttr } from './escape-attr.ts';
import { popupThumb } from './popup-thumb.ts';

/** One event inside a cluster popup's list. */
export type ClusterRow = Readonly<{
  href: string;
  image: string | undefined;
  title: string;
  when: string;
}>;

/**
 * A single row of the cluster popup: thumbnail on the left, title and date
 * stacked beside it. Like the single-event card, `href` is an app-generated
 * path and every data-derived value is escaped.
 */
export const clusterRowHtml = (row: ClusterRow): string =>
  `<a class="map-clus-row" href="${row.href}"><span class="map-clus-thumb">${popupThumb(row.image)}</span>` +
  `<span class="map-clus-text"><span class="map-clus-title">${escapeAttr(row.title)}</span>` +
  `<span class="map-pop-when">${escapeAttr(row.when)}</span></span></a>`;
