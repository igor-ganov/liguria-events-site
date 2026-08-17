import { rootAdmins } from '../auth/root-admins.ts';
import { performUserAction } from './perform-user-action.ts';
import { rootAdminDenial } from './root-admin-denial.ts';
import { userActionDenial } from './user-action-denial.ts';
import { userActionRequest } from './user-action-request.ts';
import type { AppUser } from '../auth/types.ts';
import type { UserActionRequest } from './user-action-request.ts';
import type { UserTarget } from './user-target.ts';

type AdminEnv = { DB: D1Database; ADMIN_EMAILS?: string };

const SELECT = 'SELECT id, email, handle FROM users WHERE id = ?';

const onTarget = async (
  env: AdminEnv,
  actor: AppUser,
  req: UserActionRequest,
  target: UserTarget,
): Promise<Response> =>
  rootAdminDenial(target, req.action, rootAdmins(env)) ??
  (await performUserAction(env.DB, actor, req, target));

/** The target is read only once the request itself passed: a 0-or-1 row, and
 *  no row is the 404 it always was. */
const withTarget = async (env: AdminEnv, actor: AppUser, req: UserActionRequest): Promise<Response> => {
  const target = await env.DB.prepare(SELECT).bind(req.id).first<UserTarget>();
  const answers = await Promise.all(
    [target].filter((row): row is UserTarget => Boolean(row)).map((row) => onTarget(env, actor, req, row)),
  );
  return answers.at(0) ?? Response.json({ error: 'not_found' }, { status: 404 });
};

/** An admin's action against an account, from request body to answer: the
 *  checks run in exactly the order they did as guard clauses. */
export const moderateUser = async (env: AdminEnv, actor: AppUser, request: Request): Promise<Response> => {
  const body: unknown = await request.json().catch(() => ({}));
  const req = userActionRequest(body);
  return userActionDenial(req, actor) ?? (await withTarget(env, actor, req));
};
