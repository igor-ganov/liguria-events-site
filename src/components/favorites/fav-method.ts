import { branch } from '../../lib/branch.ts';

/** Which verb a toggle sends to /api/favorites. */
export const favMethod = (turningOn: boolean): string =>
  branch(turningOn)(() => 'POST', () => 'DELETE');
