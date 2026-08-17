import { isDefined } from '../is-defined.ts';
import type { AppUser } from './types.ts';

/** Someone who may write: signed in and not banned. `locals.user` is either
 *  undefined or a user built by `toUser`, whose `banned` is a real boolean, so
 *  this is the old `!user` / `user.banned` pair of guards unchanged. */
export const isActiveMember = (user: AppUser | undefined): user is AppUser =>
  [user].filter(isDefined).some((member) => !member.banned);
