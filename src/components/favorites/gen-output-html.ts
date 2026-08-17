import { branch } from '../../lib/branch.ts';
import { genBaseOf } from './gen-base-of.ts';
import { genPayload } from './gen-payload.ts';
import { genState } from './gen-state.ts';
import { renderItinerary } from './route-render.ts';
import { renderTimeline } from './route-timeline.ts';
import { routeSpanHtml } from './route-span-html.ts';
import { viewToggleHtml } from './view-toggle-html.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { RouteDay } from '../../lib/favorites/build-route.ts';
import type { RouteView } from './to-view.ts';
import type { Ui } from './route-render.ts';

type Body = (days: readonly RouteDay[], lang: Locale, ui: Ui) => string;

const BODY: Readonly<Record<RouteView, Body>> = {
  list: (days, lang, ui) =>
    renderItinerary(days, genState.mode, lang, ui, genState.durations, genBaseOf),
  timeline: (days, lang) => renderTimeline(days, genPayload(genState), genState.byId, lang),
};

/** The generated route's whole output pane: the day span, the view switch and
 *  the itinerary or timeline. An empty route paints nothing at all. */
export const genOutputHtml = (days: readonly RouteDay[], lang: Locale, ui: Ui): string =>
  branch(days.length === 0)(
    () => '',
    () =>
      routeSpanHtml(genState.range.from, days.at(-1)?.day ?? genState.range.from, lang) +
      viewToggleHtml(
        genState.view,
        { list: ui.route.viewList, timeline: ui.route.viewTimeline },
        'route-views no-print',
      ) +
      BODY[genState.view](days, lang, ui),
  );
