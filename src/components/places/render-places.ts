import { isDefined } from '../../lib/is-defined.ts';
import { setHidden } from '../../lib/dom/set-hidden.ts';
import { setText } from '../../lib/dom/set-text.ts';
import { placeCardHtml } from './place-card-html.ts';
import { placeCountLabel } from './place-count-label.ts';
import { visiblePlaces } from './visible-places.ts';
import type { Place } from '../../lib/places/place-schema.ts';
import type { PlacesState } from './places-state.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { PreparedIndex } from '../../lib/search/index.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

// A region's whole place set is thousands of cards; drawing every one costs
// more than anybody scrolls.
const RENDER_CAP = 600;

/** Everything the grid draws from — fixed for the page, unlike the filters. */
export type PlacesView = {
  readonly all: readonly Place[];
  readonly index: PreparedIndex;
  readonly byId: ReadonlyMap<string, Place>;
  readonly lang: Locale;
  readonly ui: Ui;
};

const el = (selector: string): HTMLElement | undefined =>
  document.querySelector<HTMLElement>(selector) ?? undefined;

const draw = (grid: HTMLElement, view: PlacesView, state: PlacesState): void => {
  const matched = visiblePlaces(view.all, view.index, view.byId, state);
  grid.innerHTML = matched.slice(0, RENDER_CAP).map(placeCardHtml(view.lang, view.ui)).join('');
  setHidden(el('[data-pl-empty]'), matched.length > 0);
  setText(el('[data-pl-count]'), placeCountLabel(matched.length, RENDER_CAP));
  setHidden(el('[data-pl-clear]'), state.cats.size === 0 && state.query === '');
};

/** Redraw the grid for the current filters. */
export const renderPlaces = (view: PlacesView, state: PlacesState): void => {
  [el('[data-pl-grid]')].filter(isDefined).forEach((grid) => draw(grid, view, state));
};
