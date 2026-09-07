// Client-rendered like the landmarks page: the grid is fetched on demand from
// the locale asset and drawn here, so event pages never carry the place payload.
import { currentRegion } from '../../lib/region/current-region.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { loadPlaces } from '../../lib/places/load-places.ts';
import { placeDoc } from './place-doc.ts';
import { placesState } from './places-state.ts';
import { prepare } from '../../lib/search/index.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { sayListAway } from '../shared/say-list-away.ts';
import { renderPlaces } from './render-places.ts';
import { wirePlaceControls } from './wire-place-controls.ts';
import type { Place } from '../../lib/places/place-schema.ts';
import type { PlacesView } from './render-places.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

const show = (all: readonly Place[], lang: Locale, ui: Ui): void => {
  const sorted = [...all].sort((a, b) => a.name.localeCompare(b.name));
  const view: PlacesView = {
    all: sorted,
    index: prepare({ lang, docs: sorted.map(placeDoc(lang, ui)) }),
    byId: new Map(sorted.map((place) => [place.id, place])),
    lang,
    ui,
  };
  const draw = (): void => renderPlaces(view, placesState);
  wirePlaceControls(placesState, draw);
  draw();
};

const start = (grid: HTMLElement): void => {
  grid.dataset['ready'] = 'true';
  const { lang, ui } = readUiIsland();
  grid.innerHTML = '<p class="lm-loading">…</p>';
  void loadPlaces(currentRegion(), lang)
    .then((all) => show(all, lang, ui))
    .catch(() => sayListAway(grid, ui));
};

/** Wire the places page: fetch the locale asset, then filter by category +
 *  fuzzy search (the vendored scorer, over name + description). */
export const initPlaces = (): void => {
  [document.querySelector<HTMLElement>('[data-pl-grid]') ?? undefined]
    .filter(isDefined)
    .filter((grid) => grid.dataset['ready'] !== 'true')
    .forEach(start);
};
