import type { AppUser } from './types.ts';

type Row = { id: string; email: string; handle: string; role: string; banned: number };

const toUser = (r: Row): AppUser => ({
  id: r.id,
  email: r.email,
  handle: r.handle,
  role: r.role === 'admin' ? 'admin' : 'member',
  banned: r.banned === 1,
});

const handleFromEmail = (email: string): string => {
  const local = email.split('@')[0] ?? '';
  const base = local.replace(/[^a-z0-9]+/gi, '').toLowerCase().slice(0, 20);
  return base.length > 0 ? base : 'user';
};

const COLS = 'id, email, handle, role, banned';

/** Emails that are always admins. Re-applied on every sign-in, so the founding
 *  account cannot be demoted or banned out of its own platform. */
export const rootAdmins = (env: { ADMIN_EMAILS?: string }): readonly string[] =>
  (env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);

export const isRootAdmin = (email: string, admins: readonly string[]): boolean =>
  admins.includes(email.trim().toLowerCase());

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
  const existing = await db
    .prepare(`SELECT ${COLS} FROM users WHERE email = ?`)
    .bind(norm)
    .first<Row>();
  if (existing && root && (existing.role !== 'admin' || existing.banned === 1)) {
    await db
      .prepare("UPDATE users SET role = 'admin', banned = 0, banned_at = NULL WHERE id = ?")
      .bind(existing.id)
      .run();
    return { user: { ...toUser(existing), role: 'admin', banned: false }, isNew: false };
  }
  if (existing) return { user: toUser(existing), isNew: false };

  const id = crypto.randomUUID();
  const base = handleFromEmail(norm);
  const clash = await db.prepare('SELECT 1 FROM users WHERE handle = ?').bind(base).first();
  const handle = clash ? `${base}-${id.slice(0, 4)}` : base;
  const role = root ? 'admin' : 'member';
  await db
    .prepare('INSERT INTO users (id, email, handle, role, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(id, norm, handle, role, nowIso)
    .run();
  return { user: { id, email: norm, handle, role, banned: false }, isNew: true };
};

/** Load a user by id (session subject). */
export const getUserById = async (db: D1Database, id: string): Promise<AppUser | null> => {
  const r = await db.prepare(`SELECT ${COLS} FROM users WHERE id = ?`).bind(id).first<Row>();
  return r ? toUser(r) : null;
};

export type AdminUserRow = AppUser & {
  created_at: string;
  banned_reason: string | null;
  published: number;
  pending: number;
  rejected: number;
};

type ListRow = Row & {
  created_at: string;
  banned_reason: string | null;
  published: number;
  pending: number;
  rejected: number;
};

/** Everyone, with a tally of what they have submitted (admin view). */
export const listUsers = async (db: D1Database): Promise<readonly AdminUserRow[]> => {
  const result = await db
    .prepare(
      `SELECT u.id, u.email, u.handle, u.role, u.banned, u.created_at, u.banned_reason,
              COUNT(CASE WHEN e.status = 'published' THEN 1 END) AS published,
              COUNT(CASE WHEN e.status IN ('pending', 'held') THEN 1 END) AS pending,
              COUNT(CASE WHEN e.status = 'rejected' THEN 1 END) AS rejected
         FROM users u
         LEFT JOIN events e ON e.submitter_id = u.id
        GROUP BY u.id
        ORDER BY u.created_at DESC
        LIMIT 500`,
    )
    .all<ListRow>();
  return (result.results ?? []).map((r) => ({
    ...toUser(r),
    created_at: r.created_at,
    banned_reason: r.banned_reason,
    published: r.published,
    pending: r.pending,
    rejected: r.rejected,
  }));
};
