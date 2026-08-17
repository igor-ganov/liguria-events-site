import { mapStyle } from './map-style.ts';
import { themeKey } from './theme-key.ts';
import type { MapLibreMap } from 'maplibre-gl';

/**
 * Follow the site theme live — `data-theme` is rewritten by the theme script,
 * including OS changes under 'system'. DOM markers (events, landmarks, places)
 * survive setStyle; only the civic GeoJSON layer has to be re-added, which is
 * what `onStyle` does once the new style has settled.
 */
export const watchTheme = (map: MapLibreMap, onStyle: () => void): void => {
  let loaded = themeKey();
  new MutationObserver(() => {
    [themeKey()]
      .filter((key) => key !== loaded)
      .forEach((key) => {
        loaded = key;
        map.setStyle(mapStyle(key));
        map.once('styledata', onStyle);
      });
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
};
