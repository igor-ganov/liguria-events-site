import { listFavorites } from './list-favorites.ts';

// Each merged id keeps its relative order via a descending added_at, so the
// list still reads newest-first afterwards.
const insertAll = (
  db: D1Database,
  userId: string,
  ids: readonly string[],
  now: number,
): Promise<unknown> => {
  const stmt = db.prepare(
    `INSERT OR IGNORE INTO favorites (user_id, event_id, added_at) VALUES (?, ?, ?)`,
  );
  return db.batch(ids.map((id, index) => stmt.bind(userId, id, now - index)));
};

/** Merge a set of (anonymous) ids into the user's favourites, then return the
 *  full merged list — the localStorage → account handoff on sign-in. An empty
 *  set skips the write entirely. */
export const syncFavorites = async (
  db: D1Database,
  userId: string,
  ids: readonly string[],
  now: number,
): Promise<readonly string[]> => {
  await Promise.all(
    [ids].filter((list) => list.length > 0).map((list) => insertAll(db, userId, list, now)),
  );
  return listFavorites(db, userId);
};
