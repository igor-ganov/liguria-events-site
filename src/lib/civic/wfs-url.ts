const BASE =
  'https://mappe.comune.genova.it/geoserver/ows?service=WFS&version=2.0.0' +
  '&request=GetFeature&typeNames=MEDIATORE:V_CIVICI_DBT_ANGOLO_GEOSERVER' +
  '&outputFormat=application/json&srsName=EPSG:4326';

/** Genoa comune WFS GetFeature URL for the civic-numbers layer in a bbox. */
export const wfsUrl = (bbox: readonly [number, number, number, number], count = 2000): string =>
  `${BASE}&count=${count}&bbox=${bbox.join(',')},EPSG:4326`;
