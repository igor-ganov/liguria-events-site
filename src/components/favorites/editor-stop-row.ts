import { branch } from '../../lib/branch.ts';
import { controlsHtml } from './controls-html.ts';
import { dayLabel, renderLeg, stopBody } from './route-render.ts';
import { editorState } from './editor-state.ts';
import { moveSelectHtml } from './move-select-html.ts';
import { moveTargetDays } from './route-edit-ops.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { RouteDay } from '../../lib/favorites/build-route.ts';
import type { Ui } from './route-render.ts';

/** One editable stop in the list view: the leg that leads to it, its number,
 *  its body and its edit controls. */
export const editorStopRow = (
  day: RouteDay,
  index: number,
  startNumber: number,
  lang: Locale,
  ui: Ui,
): string => {
  const { payload } = editorState;
  const stop = day.stops[index]!;
  const days = moveTargetDays(payload.groups, stop, day.day);
  const move = moveSelectHtml(
    stop.id,
    day.day,
    days.map((target) => ({ value: target, label: dayLabel(target, lang) })),
    ui.route.moveDay,
  );
  const labels = { moveUp: ui.route.moveUp, moveDown: ui.route.moveDown, remove: ui.route.remove };
  const controls = controlsHtml(stop.id, day.day, index, day.stops.length - 1, move, labels);
  return (
    branch(index > 0)(() => renderLeg(day.legs[index - 1]!, payload.mode, ui), () => '') +
    `<li class="route-stop route-stop--edit"><span class="route-num">${startNumber + index + 1}</span>` +
    `<div class="route-stop-main">${stopBody(stop, lang, payload.durations)}${controls}</div></li>`
  );
};
