// The favourited-POI store, split one function per file. This module is the
// entry point the pages import; each part lives next to it and is unit-tested
// on its own. Events keep resolving from the corpus — this is POIs only.
export type { FavPoi } from './fav-poi.ts';
export { parseFavPoiMap } from './parse-fav-poi-map.ts';
export { parseFavPoiAttr } from './parse-fav-poi-attr.ts';
export { readFavPois } from './read-fav-pois.ts';
export { setFavPoi } from './set-fav-poi.ts';
export { deleteFavPoi } from './delete-fav-poi.ts';
