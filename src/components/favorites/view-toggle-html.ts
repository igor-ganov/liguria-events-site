import { escHtml } from './esc-html.ts';
import type { RouteView } from './to-view.ts';

export type ViewLabels = Readonly<{ list: string; timeline: string }>;

/** The list/timeline switch. The generator hides it when printing; the owner
 *  editor keeps it, hence the caller-supplied class. */
export const viewToggleHtml = (
  view: RouteView,
  labels: ViewLabels,
  groupClass: string,
): string =>
  `<div class="${groupClass}" role="group">` +
  `<button type="button" class="chip" data-route-view="list" aria-pressed="${view === 'list'}">${escHtml(labels.list)}</button>` +
  `<button type="button" class="chip" data-route-view="timeline" aria-pressed="${view === 'timeline'}">${escHtml(labels.timeline)}</button>` +
  `</div>`;
