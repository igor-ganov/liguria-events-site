/**
 * The map coordinate of anything stored with separate lat/lng fields (landmarks
 * and places), in GeoJSON's [lng, lat] order.
 */
export const geoPoint = (item: Readonly<{ lat: number; lng: number }>): readonly [number, number] => [
  item.lng,
  item.lat,
];
