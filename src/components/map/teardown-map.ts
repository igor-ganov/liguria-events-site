import { activeMap } from './active-map.ts';

/** Release the WebGL context and the map's listeners when leaving the page by
 *  SPA navigation. Without this each visit leaked a context until the browser
 *  dropped the oldest, leaving a blank basemap under the (DOM) markers. */
export const teardownMap = (): void => {
  activeMap.current?.remove();
  activeMap.current = undefined;
};
