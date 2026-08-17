import { branch } from '../branch.ts';
import { handleFromEmail } from './handle-from-email.ts';
import type { AppUser } from './types.ts';

const INSERT = 'INSERT INTO users (id, email, handle, role, created_at) VALUES (?, ?, ?, ?, ?)';
const HANDLE_TAKEN = 'SELECT 1 FROM users WHERE handle = ?';

/** First sign-in for an email: mint the account. The handle derived from the
 *  email gets a slice of the new id appended when it is already taken. */
export const createUser = async (
  db: D1Database,
  email: string,
  root: boolean,
  nowIso: string,
): Promise<AppUser> => {
  const id = crypto.randomUUID();
  const base = handleFromEmail(email);
  const clash = await db.prepare(HANDLE_TAKEN).bind(base).first();
  const handle = [clash].filter((row) => Boolean(row)).map(() => `${base}-${id.slice(0, 4)}`).at(0) ?? base;
  const role = branch(root)<AppUser['role']>(
    () => 'admin',
    () => 'member',
  );
  await db.prepare(INSERT).bind(id, email, handle, role, nowIso).run();
  return { id, email, handle, role, banned: false };
};
