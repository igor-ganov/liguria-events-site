import { isDefined } from '../is-defined.ts';
import { userActionHandler } from './user-action-handler.ts';
import type { UserTarget } from './user-target.ts';

/** Run the named action; false when the name is not one of the five, in which
 *  case nothing at all was touched (the endpoint answers 400). */
export const applyUserAction = async (
  db: D1Database,
  action: string,
  target: UserTarget,
  reason: string,
  now: string,
): Promise<boolean> => {
  const ran = await Promise.all(
    [userActionHandler(action)].filter(isDefined).map((handler) => handler(db, target, reason, now)),
  );
  return ran.length > 0;
};
