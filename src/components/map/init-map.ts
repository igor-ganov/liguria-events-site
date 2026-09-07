import { failMap } from './fail-map.ts';
import { isDefined } from '../../lib/is-defined.ts';

/**
 * Wire the map page, once per canvas — it runs again after every SPA swap.
 *
 * The map engine (maplibre + pmtiles + the basemap style, ~1.1 MB) sits behind a
 * dynamic import so it is NOT part of the page's entry chunk: the shell, the
 * filters and the loading skeleton paint immediately and the engine streams in
 * behind them. Loaded statically it blocked first render for the whole download
 * — on a throttled connection that was a ~21 s blank canvas.
 *
 * `data-ready` is stamped BEFORE the await, so a second call (a fast double SPA
 * swap) cannot start a second map while the first import is still in flight.
 */
export const initMap = (): void => {
  [document.querySelector<HTMLElement>('[data-map-canvas]') ?? undefined]
    .filter(isDefined)
    .filter((canvas) => canvas.dataset['ready'] !== 'true')
    .forEach((canvas) => {
      canvas.dataset['ready'] = 'true';
      void import('./start-map.ts')
        .then(({ startMap }) => startMap(canvas))
        .catch(() => failMap(canvas));
    });
};
