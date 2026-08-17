import type { AppUser } from './types.ts';

/** A banned account may not write. Undefined for everyone else — including a
 *  signed-out visitor, whom this check has never refused. */
export const bannedDenial = (user: AppUser | undefined): Response | undefined =>
  [user]
    .filter((member) => member?.banned)
    .map(() => Response.json({ error: 'banned' }, { status: 403 }))
    .at(0);
