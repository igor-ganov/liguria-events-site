import { boundsBbox } from '../../lib/map/bounds-bbox.ts';
import { regionsInView } from '../../lib/region/region-bounds.ts';
import type { MapLibreMap } from 'maplibre-gl';

/** The regions whose bbox the viewport currently touches — the shards a POI
 *  layer would have to hold to cover what is on screen. */
export const inViewRegions = (map: MapLibreMap): readonly string[] =>
  regionsInView(...boundsBbox(map.getBounds()));
