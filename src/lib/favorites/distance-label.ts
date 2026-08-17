import { branch } from '../branch.ts';

const KM = 1000;

/** A leg's length, in the unit that reads best: '1.2 km' or '640 m'. */
export const distanceLabel = (meters: number): string =>
  branch(meters >= KM)(
    () => `${(meters / KM).toFixed(1)} km`,
    () => `${meters} m`,
  );
