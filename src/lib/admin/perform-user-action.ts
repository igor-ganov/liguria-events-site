import { applyUserAction } from './apply-user-action.ts';
import { logUserAction } from './log-user-action.ts';
import type { AppUser } from '../auth/types.ts';
import type { UserActionRequest } from './user-action-request.ts';
import type { UserTarget } from './user-target.ts';

const succeed = async (
  db: D1Database,
  actor: AppUser,
  req: UserActionRequest,
  target: UserTarget,
  now: string,
): Promise<Response> => {
  await logUserAction(db, actor, req, target, now);
  return Response.json({ ok: true });
};

/** Run the action and log it. An unknown action changes nothing and is a 400. */
export const performUserAction = async (
  db: D1Database,
  actor: AppUser,
  req: UserActionRequest,
  target: UserTarget,
): Promise<Response> => {
  const now = new Date().toISOString();
  const done = await applyUserAction(db, req.action, target, req.reason, now);
  const logged = await Promise.all([done].filter((ok) => ok).map(() => succeed(db, actor, req, target, now)));
  return logged.at(0) ?? Response.json({ error: 'bad_request' }, { status: 400 });
};
