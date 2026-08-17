import { editorState } from './editor-state.ts';
import { fetchCorpus, parsePayload } from './route-payload.ts';
import { ownerFavourites } from './owner-favourites.ts';
import { poiToStop } from '../../lib/favorites/build-route.ts';
import { readFavPois } from '../../lib/favorites/fav-pois.ts';
import { renderEditor } from './render-editor.ts';
import type { RouteStop } from '../../lib/favorites/build-route.ts';

// Stops resolve from events (the corpus) AND landmarks/places (POIs), so a
// route can mix all three and "add from favourites" offers POIs too. POI data
// comes from the route's own payload plus this device's favourites.
const start = async (island: string): Promise<void> => {
  editorState.payload = parsePayload(island);
  editorState.favourites = ownerFavourites();
  editorState.poiMap = { ...editorState.payload.pois, ...readFavPois() };
  const pois = Object.values(editorState.poiMap).map(poiToStop);
  const stops: readonly RouteStop[] = [...(await fetchCorpus()), ...pois];
  editorState.byId = new Map(stops.map((stop) => [stop.id, stop]));
  renderEditor();
};

/** Shell: read the route embedded in the page (#route-data) and render it. A
 *  page without that island is not a route page. */
export const loadRouteEditor = async (): Promise<void> => {
  const island = document.querySelector<HTMLElement>('#route-data')?.textContent ?? '';
  await Promise.all([island].filter((text) => text !== '').map(start));
};
