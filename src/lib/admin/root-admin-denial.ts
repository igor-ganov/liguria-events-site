import { isRootAdmin } from '../auth/is-root-admin.ts';
import type { UserTarget } from './user-target.ts';

/** A root admin may not be demoted, banned or have their events purged — the
 *  only action allowed against them is 'promote'. Undefined means "carry on". */
export const rootAdminDenial = (
  target: UserTarget,
  action: string,
  admins: readonly string[],
): Response | undefined =>
  [target]
    .filter((t) => isRootAdmin(t.email, admins) && action !== 'promote')
    .map(() => Response.json({ error: 'root_admin' }, { status: 400 }))
    .at(0);
