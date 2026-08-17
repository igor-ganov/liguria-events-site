import { isDefined } from '../../lib/is-defined.ts';
import { setHidden } from '../../lib/dom/set-hidden.ts';
import { setText } from '../../lib/dom/set-text.ts';
import { landmarkCardHtml } from './landmark-card-html.ts';
import { landmarkCountLabel } from './landmark-count-label.ts';
import { visibleLandmarks } from './visible-landmarks.ts';
import type { Landmark } from '../../lib/landmarks/landmark-schema.ts';
import type { LandmarksState } from './landmarks-state.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { PreparedIndex } from '../../lib/search/index.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

// A region's whole landmark set is thousands of cards; drawing every one costs
// more than anybody scrolls.
const RENDER_CAP = 600;

/** Everything the grid draws from — fixed for the page, unlike the filters. */
export type LandmarksView = {
  readonly all: readonly Landmark[];
  readonly index: PreparedIndex;
  readonly byId: ReadonlyMap<string, Landmark>;
  readonly lang: Locale;
  readonly ui: Ui;
};

const el = (selector: string): HTMLElement | undefined =>
  document.querySelector<HTMLElement>(selector) ?? undefined;

const draw = (grid: HTMLElement, view: LandmarksView, state: LandmarksState): void => {
  const matched = visibleLandmarks(view.all, view.index, view.byId, state);
  grid.innerHTML = matched
    .slice(0, RENDER_CAP)
    .map(landmarkCardHtml(view.lang, view.ui))
    .join('');
  setHidden(el('[data-lm-empty]'), matched.length > 0);
  setText(el('[data-lm-count]'), landmarkCountLabel(matched.length, RENDER_CAP));
  setHidden(el('[data-lm-clear]'), state.kinds.size === 0 && state.query === '');
};

/** Redraw the grid for the current filters. */
export const renderLandmarks = (view: LandmarksView, state: LandmarksState): void => {
  [el('[data-lm-grid]')].filter(isDefined).forEach((grid) => draw(grid, view, state));
};
