// Accounts in D1. Every statement now lives in its own module — one query per
// file, with the pure shaping (to-user.ts, handle-from-email.ts,
// needs-root-repair.ts, the root-admin pair) split out and unit-tested. This
// file stays the import surface the pages, endpoints and middleware already use.
export type { AdminListRow, AdminUserRow, UserRow } from './user-row.ts';
export { findOrCreateUser } from './find-or-create-user.ts';
export { getUserById } from './get-user-by-id.ts';
export { isRootAdmin } from './is-root-admin.ts';
export { listUsers } from './list-users.ts';
export { rootAdmins } from './root-admins.ts';
