import { branch } from '../branch.ts';
import type { Feature } from 'geojson';

/**
 * The features carried by a WFS response body. The comune's endpoint is
 * third-party JSON, so the body is read as unknown: `Object(x)` yields `{}` for
 * a nullish or primitive body, and anything that is not an array of features
 * reads as none — one malformed tile can never break the civic layer.
 */
export const wfsFeatures = (body: unknown): readonly Feature[] => {
  const features: unknown = Object(body)['features'];
  return branch(Array.isArray(features))(
    () => Array.from<Feature>(Object(features)),
    () => [],
  );
};
