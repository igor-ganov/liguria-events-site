import { createUser } from './create-user.ts';
import { existingUser } from './existing-user.ts';
import { isRootAdmin } from './is-root-admin.ts';
import { USER_COLS } from './user-select-cols.ts';
import type { AppUser } from './types.ts';
import type { UserRow } from './user-row.ts';

const BY_EMAIL = `SELECT ${USER_COLS} FROM users WHERE email = ?`;

/** Find a user by email, creating one on first sign-in. `isNew` is true when
 *  the account was just created (used to offer passkey setup). */
export const findOrCreateUser = async (
  db: D1Database,
  email: string,
  nowIso: string,
  admins: readonly string[] = [],
): Promise<{ user: AppUser; isNew: boolean }> => {
  const norm = email.trim().toLowerCase();
  const root = isRootAdmin(norm, admins);
  const existing = await db.prepare(BY_EMAIL).bind(norm).first<UserRow>();
  // 0-or-1 row: `Boolean(row)` keeps the original truthiness test verbatim.
  const found = await Promise.all(
    [existing].filter((row): row is UserRow => Boolean(row)).map((row) => existingUser(db, row, root)),
  );
  return { user: found.at(0) ?? (await createUser(db, norm, root, nowIso)), isNew: found.length === 0 };
};
