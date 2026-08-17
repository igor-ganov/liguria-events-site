import { branch } from '../branch.ts';

const median = (values: readonly number[]): number =>
  values.toSorted((a, b) => a - b)[Math.floor(values.length / 2)] ?? 0;

/**
 * The body of a set of [lng, lat] points: those within ~1.6° lng / ~1.2° lat of
 * its median. One mis-geocoded event used to drag the opening view across half
 * the country, so the camera is fitted to THESE, not to the extremes. Falls back
 * to the whole set when the trim would empty it.
 */
export const corePoints = (
  points: readonly (readonly [number, number])[],
): readonly (readonly [number, number])[] => {
  const midLng = median(points.map((point) => point[0]));
  const midLat = median(points.map((point) => point[1]));
  const core = points.filter(
    (point) => Math.abs(point[1] - midLat) < 1.2 && Math.abs(point[0] - midLng) < 1.6,
  );
  return branch(core.length > 0)(
    () => core,
    () => points,
  );
};
