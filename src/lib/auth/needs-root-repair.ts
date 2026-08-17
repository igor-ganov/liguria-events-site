import type { UserRow } from './user-row.ts';

/** A root admin's row drifted from what the env grants it — it was demoted or
 *  banned. Sign-in puts it back; nobody else's row is ever touched. */
export const needsRootRepair = (row: UserRow, root: boolean): boolean =>
  root && (row.role !== 'admin' || row.banned === 1);
