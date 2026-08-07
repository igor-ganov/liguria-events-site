// Per-user favourites and saved routes in D1 (0007 migration). Favourites are a
// simple set of event ids; saved routes carry their computed itinerary as JSON
// so they reopen as generated. This module is query-heavy by nature (lint-exempt
// like src/lib/places).

export type SavedRoute = Readonly<{ id: string; name: string; data: string; createdAt: number }>;

/** The user's favourite event ids, newest first. */
export const listFavorites = async (db: D1Database, userId: string): Promise<readonly string[]> => {
  const res = await db
    .prepare(`SELECT event_id AS id FROM favorites WHERE user_id = ? ORDER BY added_at DESC`)
    .bind(userId)
    .all<{ id: string }>();
  return (res.results ?? []).map((row) => row.id);
};

export const addFavorite = async (
  db: D1Database,
  userId: string,
  eventId: string,
  addedAt: number,
): Promise<void> => {
  await db
    .prepare(`INSERT OR IGNORE INTO favorites (user_id, event_id, added_at) VALUES (?, ?, ?)`)
    .bind(userId, eventId, addedAt)
    .run();
};

export const removeFavorite = async (db: D1Database, userId: string, eventId: string): Promise<void> => {
  await db.prepare(`DELETE FROM favorites WHERE user_id = ? AND event_id = ?`).bind(userId, eventId).run();
};

/** Merge a set of (anonymous) ids into the user's favourites, then return the
 *  full merged list — the localStorage → account handoff on sign-in. */
export const syncFavorites = async (
  db: D1Database,
  userId: string,
  ids: readonly string[],
  now: number,
): Promise<readonly string[]> => {
  if (ids.length > 0) {
    const stmt = db.prepare(`INSERT OR IGNORE INTO favorites (user_id, event_id, added_at) VALUES (?, ?, ?)`);
    await db.batch(ids.map((id, i) => stmt.bind(userId, id, now - i)));
  }
  return listFavorites(db, userId);
};

/** The user's saved routes, newest first (id, name, created — not the payload). */
export const listRoutes = async (db: D1Database, userId: string): Promise<readonly SavedRoute[]> => {
  const res = await db
    .prepare(`SELECT id, name, data, created_at AS createdAt FROM saved_routes WHERE user_id = ? ORDER BY created_at DESC`)
    .bind(userId)
    .all<SavedRoute>();
  return res.results ?? [];
};

export const saveRoute = async (
  db: D1Database,
  userId: string,
  route: Readonly<{ id: string; name: string; data: string }>,
  now: number,
): Promise<void> => {
  await db
    .prepare(
      `INSERT INTO saved_routes (id, user_id, name, data, created_at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET name = excluded.name, data = excluded.data`,
    )
    .bind(route.id, userId, route.name, route.data, now)
    .run();
};

export const deleteRoute = async (db: D1Database, userId: string, id: string): Promise<void> => {
  await db.prepare(`DELETE FROM saved_routes WHERE user_id = ? AND id = ?`).bind(userId, id).run();
};
