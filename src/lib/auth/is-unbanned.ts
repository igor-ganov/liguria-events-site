import type { AppUser } from './types.ts';

/** A signed-in person who may still write: the endpoints' own
 *  `if (user.banned) return 403` test, inverted into a predicate. */
export const isUnbanned = (user: AppUser): boolean => !user.banned;
