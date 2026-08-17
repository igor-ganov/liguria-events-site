import { branch } from '../branch.ts';
import type { AppUser } from './types.ts';
import type { UserRow } from './user-row.ts';

/** Shape a user row into the app's user. Anything other than the exact string
 *  'admin' is a member, and only banned = 1 counts as banned — both kept
 *  strictly as they were, since they decide what a person may do. */
export const toUser = (row: UserRow): AppUser => ({
  id: row.id,
  email: row.email,
  handle: row.handle,
  role: branch(row.role === 'admin')<AppUser['role']>(
    () => 'admin',
    () => 'member',
  ),
  banned: row.banned === 1,
});
