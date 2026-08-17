import type { AppUser } from '../auth/types.ts';
import type { UserActionRequest } from './user-action-request.ts';

const badRequest = (): Response => Response.json({ error: 'bad_request' }, { status: 400 });

// An admin may not demote, ban or purge themselves — that is how a platform
// ends up with nobody able to moderate it.
const self = (): Response => Response.json({ error: 'self' }, { status: 400 });

/** Why the request is refused before any row is read: no id at all, or an
 *  admin aiming at their own account. Undefined means "carry on", and the two
 *  refusals stay in their original order. */
export const userActionDenial = (req: UserActionRequest, actor: AppUser): Response | undefined =>
  [
    ...[req].filter((r) => r.id === '').map(badRequest),
    ...[req].filter((r) => r.id === actor.id).map(self),
  ].at(0);
