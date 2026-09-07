import { quickenFailure } from './quicken-failure.ts';
import { setHidden } from '../../lib/dom/set-hidden.ts';
import { whenMapReady } from './when-map-ready.ts';
import type { MapContext } from './map-context.ts';

// On a slow link, reveal the map after a few seconds — the DOM markers are
// already there and base tiles keep streaming in — rather than blocking on a
// full tile load. Only surface Retry if the map truly never comes up.
const SOFT_REVEAL = 9000;
const HARD_FAIL = 30000;

/**
 * The loading skeleton, its soft reveal and the retry panel. `data-loading`
 * starts "true" in the MARKUP on purpose: the maplibre bundle (~1.1 MB)
 * downloads before this script runs, and without it the canvas sat empty — and
 * felt frozen — for that whole time.
 */
export const wireMapLoading = (context: MapContext): void => {
  const { canvas } = context;
  const retry = document.querySelector<HTMLElement>('[data-map-retry]') ?? undefined;
  let loaded = false;
  const reveal = (showRetry: boolean) => (): void => {
    [0].filter(() => !loaded).forEach(() => {
      canvas.dataset['loading'] = 'false';
      setHidden(retry, !showRetry);
    });
  };
  canvas.dataset['loading'] = 'true';
  const soft = setTimeout(reveal(false), SOFT_REVEAL);
  const hard = setTimeout(reveal(true), HARD_FAIL);
  const stopQuick = quickenFailure(context.map, reveal(true));
  // whenMapReady, not map.on('load'): this runs after the corpus fetch, so the
  // style may already have loaded — otherwise the skeleton stayed up until the
  // soft-reveal timer even though the map was live. See when-map-ready.ts.
  whenMapReady(context.map, () => {
    loaded = true;
    clearTimeout(soft);
    clearTimeout(hard);
    stopQuick();
    canvas.dataset['loading'] = 'false';
    setHidden(retry, true);
  });
  document
    .querySelector('[data-map-reload]')
    ?.addEventListener('click', () => location.reload());
};
