import { addableEvents } from './route-edit-ops.ts';
import { addSelectHtml } from './add-select-html.ts';
import { armedDayKind } from './armed-day-kind.ts';
import { baseLegs, dayLabel, gmapsButton } from './route-render.ts';
import { dayBaseControlsHtml } from './day-base-controls-html.ts';
import { editorBaseOf } from './editor-base-of.ts';
import { editorState } from './editor-state.ts';
import { editorStopRow } from './editor-stop-row.ts';
import { escHtml } from './esc-html.ts';
import { titleOf } from '../../lib/events/title-of.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { RouteDay } from '../../lib/favorites/build-route.ts';
import type { Ui } from './route-render.ts';

/** One editable day section: its heading, the stops with their legs and the
 *  base rows around them, its base pickers and its "add a favourite" box. */
export const editorDayHtml = (day: RouteDay, startNumber: number, lang: Locale, ui: Ui): string => {
  const { payload, favourites, byId, pick } = editorState;
  const base = editorBaseOf(day.day);
  const rows = day.stops
    .map((_stop, index) => editorStopRow(day, index, startNumber, lang, ui))
    .join('');
  const legs = baseLegs(day, base, payload.mode, ui);
  const addable = addableEvents(payload.groups, favourites, byId, day.day);
  const add = addSelectHtml(
    day.day,
    addable.map((event) => ({ value: event.id, label: titleOf(lang)(event) })),
    ui.route.addFav,
  );
  const bases = dayBaseControlsHtml(day.day, armedDayKind(pick, day.day), {
    dayBase: ui.route.dayBase,
    dayFinal: ui.route.dayFinal,
  });
  return (
    `<section class="route-day" data-day="${escHtml(day.day)}">` +
    `<h3>${escHtml(dayLabel(day.day, lang))}${gmapsButton(day, payload.mode, base)}</h3>` +
    `<ul class="route-list">${legs.before}${rows}${legs.after}</ul>${bases}${add}</section>`
  );
};
