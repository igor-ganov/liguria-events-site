import { toUser } from './to-user.ts';
import type { AdminListRow, AdminUserRow } from './user-row.ts';

const SQL = `SELECT u.id, u.email, u.handle, u.role, u.banned, u.created_at, u.banned_reason,
              COUNT(CASE WHEN e.status = 'published' THEN 1 END) AS published,
              COUNT(CASE WHEN e.status IN ('pending', 'held') THEN 1 END) AS pending,
              COUNT(CASE WHEN e.status = 'rejected' THEN 1 END) AS rejected
         FROM users u
         LEFT JOIN events e ON e.submitter_id = u.id
        GROUP BY u.id
        ORDER BY u.created_at DESC
        LIMIT 500`;

/** Everyone, with a tally of what they have submitted (admin view). */
export const listUsers = async (db: D1Database): Promise<readonly AdminUserRow[]> => {
  const result = await db.prepare(SQL).all<AdminListRow>();
  return (result.results ?? []).map((row) => ({
    ...toUser(row),
    created_at: row.created_at,
    banned_reason: row.banned_reason,
    published: row.published,
    pending: row.pending,
    rejected: row.rejected,
  }));
};
