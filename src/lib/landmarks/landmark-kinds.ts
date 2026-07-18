/** Landmark kinds — drive the marker icon, colour and the on-page filter chips. */
export const LANDMARK_KINDS = [
  'castle',
  'church',
  'museum',
  'palace',
  'monument',
  'tower',
  'lighthouse',
  'square',
  'park',
  'heritage',
  'beach',
  'attraction',
] as const;

export type LandmarkKind = (typeof LANDMARK_KINDS)[number];
