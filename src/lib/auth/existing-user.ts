import { needsRootRepair } from './needs-root-repair.ts';
import { toUser } from './to-user.ts';
import type { AppUser } from './types.ts';
import type { UserRow } from './user-row.ts';

const REPAIR = "UPDATE users SET role = 'admin', banned = 0, banned_at = NULL WHERE id = ?";

/** The user behind an existing row: re-granted admin (and unbanned) when the
 *  row belongs to a root admin that drifted, untouched otherwise. */
export const existingUser = async (db: D1Database, row: UserRow, root: boolean): Promise<AppUser> => {
  const repaired = await Promise.all(
    [row]
      .filter((candidate) => needsRootRepair(candidate, root))
      .map(async (candidate): Promise<AppUser> => {
        await db.prepare(REPAIR).bind(candidate.id).run();
        return { ...toUser(candidate), role: 'admin', banned: false };
      }),
  );
  return repaired.at(0) ?? toUser(row);
};
