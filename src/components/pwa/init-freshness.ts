import { agePhrase } from './age-phrase.ts';
import { askWorker } from './ask-worker.ts';
import { freshnessLine } from '../../lib/pwa/freshness-line.ts';
import { freshnessOver } from '../../lib/pwa/freshness-over.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { pageState } from './page-state.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { renderFreshness } from './render-freshness.ts';
import type { FreshnessOver } from '../../lib/pwa/freshness-over.ts';

/**
 * The bar that says what the reader is looking at.
 *
 * A page from the device says how old it is — signal or no signal, because
 * being online does not make a stored copy current. The worker is asking the
 * site behind it, and what it found turns the bar into either "no connection"
 * or an offer of the newer version. Nothing is swapped underneath anybody: a
 * reader mid-sentence decides when to take it.
 */
export const initFreshness = (): void => {
  const bar = document.querySelector<HTMLElement>('[data-offline-notice]') ?? undefined;
  const { lang, ui } = readUiIsland();
  const state = pageState(Date.now());
  const words = { offline: ui.offline.notice, saved: ui.offline.saved, updated: ui.offline.updated };
  const age = agePhrase(lang, state.age);

  [bar].filter(isDefined).forEach((element) => {
    const draw = (over: FreshnessOver): void =>
      renderFreshness(element, freshnessLine(words, { ...state, age, ...over }), ui.offline.reload, over.updated);
    draw({ updated: false, offline: false });
    askWorker(location.href, (kind) => draw(freshnessOver(kind)));
  });
};
