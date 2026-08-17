import { isDefined } from '../is-defined.ts';
import type { AppUser } from './types.ts';

const banned = (): Response => Response.json({ error: 'banned' }, { status: 403 });
const unauthorized = (): Response => Response.json({ error: 'unauthorized' }, { status: 401 });

/** The refusal for a caller who may not write: a banned account is 403, no
 *  session at all is 401. An active member is never asked — the caller has
 *  already handled them — and gets the 401 as the safe default. */
export const memberDenial = (user: AppUser | undefined): Response =>
  [user].filter(isDefined).filter((member) => member.banned).map(banned).at(0) ?? unauthorized();
