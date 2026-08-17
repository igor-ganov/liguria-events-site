import { listUserPasskeys } from './credentials.ts';
import type { PasskeyInfo } from './credentials.ts';
import type { AppUser } from './types.ts';

/** A person's registered passkeys — none at all for a signed-out visitor, so
 *  the settings page never queries D1 without an owner to query for. */
export const passkeysOf =
  (db: D1Database) =>
  async (user?: AppUser): Promise<readonly PasskeyInfo[]> => {
    const owners = [user].filter((u) => u !== undefined);
    const lists = await Promise.all(owners.map((u) => listUserPasskeys(db, u.id)));
    return lists.flat();
  };
