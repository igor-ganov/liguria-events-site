import { branch } from '../../lib/branch.ts';
import { dayNumbers } from './day-numbers.ts';
import { editorDayHtml } from './editor-day-html.ts';
import { editorState } from './editor-state.ts';
import { escHtml } from './esc-html.ts';
import { renderTimeline } from './route-timeline.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { RouteDay } from '../../lib/favorites/build-route.ts';
import type { RouteView } from './to-view.ts';
import type { Ui } from './route-render.ts';

type Body = (days: readonly RouteDay[], lang: Locale, ui: Ui) => string;

const listHtml: Body = (days, lang, ui) => {
  const starts = dayNumbers(days);
  return days.map((day, index) => editorDayHtml(day, starts[index] ?? 0, lang, ui)).join('');
};

const BODY: Readonly<Record<RouteView, Body>> = {
  list: listHtml,
  timeline: (days, lang) => renderTimeline(days, editorState.payload, editorState.byId, lang, true),
};

/** The editor's day content — the timeline it opens on, or the editable list. */
export const editorBodyHtml = (days: readonly RouteDay[], lang: Locale, ui: Ui): string =>
  branch(days.length === 0)(
    () => `<p class="feed-empty">${escHtml(ui.route.empty)}</p>`,
    () => BODY[editorState.view](days, lang, ui),
  );
