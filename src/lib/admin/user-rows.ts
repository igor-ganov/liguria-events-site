import { isRootAdmin } from '../auth/users.ts';
import type { AdminUserRow } from '../auth/users.ts';
import type { EventRow } from '../events/list-events.ts';

/** One row of the admin users table, with everything the markup needs decided. */
export type UserRowData<U = AdminUserRow, E = EventRow> = Readonly<{
  user: U;
  root: boolean;
  mine: boolean;
  events: readonly E[];
}>;

/** Pair every account with its submissions and the two facts that disarm the
 *  action buttons: a root admin cannot be touched, and neither can your own.
 *  Only the id and the email are read, so the row shape stays the caller's. */
export const userRows = <U extends { id: string; email: string }, E>(
  users: readonly U[],
  submissions: ReadonlyMap<string, readonly E[]>,
  admins: readonly string[],
  meId: string,
): readonly UserRowData<U, E>[] =>
  users.map((user) => ({
    user,
    root: isRootAdmin(user.email, admins),
    mine: user.id === meId,
    events: submissions.get(user.id) ?? [],
  }));
