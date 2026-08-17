import { toUser } from './to-user.ts';
import { USER_COLS } from './user-select-cols.ts';
import type { AppUser } from './types.ts';
import type { UserRow } from './user-row.ts';

const BY_ID = `SELECT ${USER_COLS} FROM users WHERE id = ?`;

/** Load a user by id (session subject); null when the id is unknown. */
export const getUserById = async (db: D1Database, id: string): Promise<AppUser | null> => {
  const row = await db.prepare(BY_ID).bind(id).first<UserRow>();
  // 0-or-1 row: `Boolean(row)` keeps the original truthiness test verbatim.
  return [row].filter((r): r is UserRow => Boolean(r)).map(toUser).at(0) ?? null;
};
