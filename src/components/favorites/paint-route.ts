import { genBaseOf } from './gen-base-of.ts';
import { genOutputHtml } from './gen-output-html.ts';
import { makeMapDrawer } from './route-render.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { setInnerHtml } from './set-inner-html.ts';
import type { RouteDay } from '../../lib/favorites/build-route.ts';

const drawMap = makeMapDrawer();

/** Shell: repaint the generated route — the output pane and the map. Module
 *  level so the view switch and a timeline drag can repaint the last route
 *  without re-running generation. */
export const paintRoute = (days: readonly RouteDay[]): void => {
  const { lang, ui } = readUiIsland();
  const output = document.querySelector<HTMLElement>('[data-route-output]') ?? undefined;
  setInnerHtml(output, genOutputHtml(days, lang, ui));
  drawMap(days, genBaseOf);
};
