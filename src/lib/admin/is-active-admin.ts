import { isDefined } from '../is-defined.ts';
import type { AppUser } from '../auth/types.ts';

/** An admin who may act: signed in, role 'admin', not banned. This is the old
 *  `!actor || actor.role !== 'admin' || actor.banned` refusal, unchanged —
 *  `locals.user` is either undefined or a user built by `toUser`, whose
 *  `banned` is always a real boolean. */
export const isActiveAdmin = (user: AppUser | undefined): user is AppUser =>
  [user].filter(isDefined).some((actor) => actor.role === 'admin' && !actor.banned);
