import { applyLegCache } from '../../lib/favorites/enrich-route.ts';
import { baseControlHtml } from './base-control-html.ts';
import { dayHoursControlHtml } from './day-hours-control-html.ts';
import { drawEditorMap } from './draw-editor-map.ts';
import { editorBaseOf } from './editor-base-of.ts';
import { editorBodyHtml } from './editor-body-html.ts';
import { editorState } from './editor-state.ts';
import { enrichRealRouting } from './enrich-real-routing.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { legCache } from './leg-cache.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { routeFromGroups } from '../../lib/favorites/build-route.ts';
import { viewToggleHtml } from './view-toggle-html.ts';

// Apply any already-cached real routing synchronously (instant), then fetch the
// rest and re-render once — so the editor never blocks on the network.
const paint = (output: HTMLElement): void => {
  const { lang, ui } = readUiIsland();
  const { payload, view, pick } = editorState;
  const built = routeFromGroups(payload.groups, payload.mode, editorState.byId);
  const days = applyLegCache(built, payload.mode, legCache);
  output.innerHTML =
    viewToggleHtml(view, { list: ui.route.viewList, timeline: ui.route.viewTimeline }, 'route-views') +
    dayHoursControlHtml(payload.dayStart, payload.dayEnd, {
      day: ui.route.day,
      setDefault: ui.route.setDefault,
    }) +
    baseControlHtml(pick?.scope, payload.base !== undefined, {
      setBase: ui.route.setBase,
      setBaseDefault: ui.route.setBaseDefault,
      clearBase: ui.route.clearBase,
      clickMap: ui.route.clickMap,
    }) +
    editorBodyHtml(days, lang, ui);
  drawEditorMap(days, editorBaseOf);
  void enrichRealRouting(days);
};

/** Shell: rebuild the itinerary from the current payload and repaint the editor
 *  and its map. Every edit ends here. */
export const renderEditor = (): void => {
  [document.querySelector<HTMLElement>('[data-route-output]') ?? undefined]
    .filter(isDefined)
    .forEach(paint);
};
