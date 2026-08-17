import { isDefined } from '../is-defined.ts';
import type { AppUser } from '../auth/types.ts';

/** Signed in, with the admin role. This is the event-moderation endpoint's own
 *  `!user || user.role !== 'admin'` refusal, unchanged — it deliberately does
 *  NOT test `banned`, because tightening a refusal is a behaviour change rather
 *  than a refactor. `isActiveAdmin` is the stricter twin used by the users
 *  endpoint. */
export const isAdmin = (user: AppUser | undefined): user is AppUser =>
  [user].filter(isDefined).some((actor) => actor.role === 'admin');
