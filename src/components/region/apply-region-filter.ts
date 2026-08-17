import { htmlChildren } from '../../lib/dom/html-children.ts';
import { setHidden } from '../../lib/dom/set-hidden.ts';
import { regionRowHits } from './region-row-hits.ts';
import type { RegionRow } from './region-row-hits.ts';

const rowOf = (row: HTMLElement): RegionRow => ({
  name: row.dataset['name'] ?? '',
  region: row.dataset['region'] ?? '',
  city: row.classList.contains('rp-city'),
  header: row.classList.contains('rp-region'),
});

/** Hide the rows that do not match what was typed, and show the empty note when
 *  nothing is left. */
export const applyRegionFilter = (list: HTMLElement, empty: HTMLElement, term: string): void => {
  const rows = htmlChildren(list);
  const hits = regionRowHits(rows.map(rowOf), term);
  rows.forEach((row, index) => {
    row.hidden = !(hits[index] ?? false);
  });
  setHidden(empty, hits.filter((hit) => hit).length > 0);
};
