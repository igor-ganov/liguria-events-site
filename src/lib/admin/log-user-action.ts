import type { AppUser } from '../auth/types.ts';
import type { UserActionRequest } from './user-action-request.ts';
import type { UserTarget } from './user-target.ts';

const SQL = 'INSERT INTO moderation_log (event_id, action, actor, reason, created_at) VALUES (?, ?, ?, ?, ?)';

/** Every admin action against an account leaves an audit row. */
export const logUserAction = async (
  db: D1Database,
  actor: AppUser,
  req: UserActionRequest,
  target: UserTarget,
  now: string,
): Promise<void> => {
  await db
    .prepare(SQL)
    .bind(`user:${target.id}`, `admin_${req.action}`, `admin:${actor.handle}`, req.reason, now)
    .run();
};
