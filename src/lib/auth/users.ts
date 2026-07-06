import type { AppUser } from './types.ts';

type Row = { id: string; email: string; handle: string; role: string };

const toUser = (r: Row): AppUser => ({
  id: r.id,
  email: r.email,
  handle: r.handle,
  role: r.role === 'admin' ? 'admin' : 'member',
});

const handleFromEmail = (email: string): string => {
  const local = email.split('@')[0] ?? '';
  const base = local.replace(/[^a-z0-9]+/gi, '').toLowerCase().slice(0, 20);
  return base.length > 0 ? base : 'user';
};

const COLS = 'id, email, handle, role';

/** Find a user by email, creating one on first sign-in (role: member). */
export const findOrCreateUser = async (db: D1Database, email: string, nowIso: string): Promise<AppUser> => {
  const norm = email.trim().toLowerCase();
  const existing = await db.prepare(`SELECT ${COLS} FROM users WHERE email = ?`).bind(norm).first<Row>();
  if (existing) return toUser(existing);

  const id = crypto.randomUUID();
  const base = handleFromEmail(norm);
  const clash = await db.prepare('SELECT 1 FROM users WHERE handle = ?').bind(base).first();
  const handle = clash ? `${base}-${id.slice(0, 4)}` : base;
  await db
    .prepare('INSERT INTO users (id, email, handle, role, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(id, norm, handle, 'member', nowIso)
    .run();
  return { id, email: norm, handle, role: 'member' };
};

/** Load a user by id (session subject). */
export const getUserById = async (db: D1Database, id: string): Promise<AppUser | null> => {
  const r = await db.prepare(`SELECT ${COLS} FROM users WHERE id = ?`).bind(id).first<Row>();
  return r ? toUser(r) : null;
};
