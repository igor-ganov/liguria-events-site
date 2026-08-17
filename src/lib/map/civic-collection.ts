import type { Feature, FeatureCollection } from 'geojson';

/** The civic numbers gathered so far, shaped as the GeoJSON source data the
 *  'civics' layer reads — the only shape maplibre's setData() accepts. */
export const civicCollection = (features: readonly Feature[]): FeatureCollection => ({
  type: 'FeatureCollection',
  features: [...features],
});
