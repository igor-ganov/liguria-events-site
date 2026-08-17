import { branch } from '../branch.ts';
import type { StyleLayer } from './style-types.ts';

/** Geometry that only exists at z13+, absent from the z12 country-wide base. */
const DETAIL_LAYERS: ReadonlySet<string> = new Set(['building']);

/**
 * Repoint the high-zoom layers at the Liguria detail source. The country-wide
 * basemap tops out at z12, where OpenMapTiles carries no building footprints,
 * so silhouettes must be read from the second, z14 extract instead.
 */
export const withDetailSource =
  (sourceId: string) =>
  (layers: readonly StyleLayer[]): readonly StyleLayer[] =>
    layers.map((layer) => {
      const sourceLayer = layer['source-layer'];
      const isDetail = typeof sourceLayer === 'string' && DETAIL_LAYERS.has(sourceLayer);
      return branch(isDetail)(
        () => ({ ...layer, source: sourceId }),
        () => layer,
      );
    });
