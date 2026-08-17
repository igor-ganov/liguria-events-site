/**
 * The region the page opened on, published by MapView's inline island. The map
 * carries every event in the country and merely OPENS here, so this only picks
 * the first camera and which shard always loads.
 */
export const mapRegion = (): string | undefined => {
  const value: unknown = Object(globalThis)['__REGION__'];
  return [value].filter((region): region is string => typeof region === 'string').at(0);
};
