// Client-rendered like the map: the grid is fetched on demand from the locale
// asset and drawn here, so event pages never carry the landmark payload.
import { currentRegion } from '../../lib/region/current-region.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { landmarkDoc } from './landmark-doc.ts';
import { landmarksState } from './landmarks-state.ts';
import { loadLandmarks } from '../../lib/landmarks/load-landmarks.ts';
import { prepare } from '../../lib/search/index.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { sayListAway } from '../shared/say-list-away.ts';
import { renderLandmarks } from './render-landmarks.ts';
import { wireLandmarkControls } from './wire-landmark-controls.ts';
import type { Landmark } from '../../lib/landmarks/landmark-schema.ts';
import type { LandmarksView } from './render-landmarks.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { Ui } from '../../lib/i18n/ui-schema.ts';

const show = (all: readonly Landmark[], lang: Locale, ui: Ui): void => {
  const sorted = [...all].sort((a, b) => a.name.localeCompare(b.name));
  const view: LandmarksView = {
    all: sorted,
    index: prepare({ lang, docs: sorted.map(landmarkDoc(lang, ui)) }),
    byId: new Map(sorted.map((landmark) => [landmark.id, landmark])),
    lang,
    ui,
  };
  const draw = (): void => renderLandmarks(view, landmarksState);
  wireLandmarkControls(landmarksState, draw);
  draw();
};

const start = (grid: HTMLElement): void => {
  grid.dataset['ready'] = 'true';
  const { lang, ui } = readUiIsland();
  grid.innerHTML = '<p class="lm-loading">…</p>';
  void loadLandmarks(currentRegion(), lang)
    .then((all) => show(all, lang, ui))
    .catch(() => sayListAway(grid, ui));
};

/** Wire the landmarks page: fetch the locale asset, then filter by kind + fuzzy
 *  search (the vendored scorer, over name + description). */
export const initLandmarks = (): void => {
  [document.querySelector<HTMLElement>('[data-lm-grid]') ?? undefined]
    .filter(isDefined)
    .filter((grid) => grid.dataset['ready'] !== 'true')
    .forEach(start);
};
