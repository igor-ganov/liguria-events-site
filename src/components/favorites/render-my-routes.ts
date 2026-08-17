import { myRouteHtml } from './my-route-html.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { setHidden } from '../../lib/dom/set-hidden.ts';
import { setInnerHtml } from './set-inner-html.ts';
import type { MyRoute } from './my-route-types.ts';

/** Shell: paint the list, hiding the whole section when there is nothing in it. */
export const renderMyRoutes = (
  rows: readonly MyRoute[],
  list: HTMLElement,
  section: HTMLElement,
): void => {
  const { ui } = readUiIsland();
  setHidden(section, rows.length === 0);
  setInnerHtml(list, rows.map((row) => myRouteHtml(row, ui)).join(''));
};
