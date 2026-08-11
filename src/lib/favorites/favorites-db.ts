// Per-user favourites and saved routes in D1 (0007 migration). Favourites are a
// simple set of event ids; saved routes carry their computed itinerary as JSON
// so they reopen as generated. This module is query-heavy by nature (lint-exempt
// like src/lib/places).

export type SavedRoute = Readonly<{
  id: string;
  name: string;
  region: string;
  data: string;
  public: boolean;
  userId: string | undefined;
  createdAt: number;
}>;

// D1 returns SQL NULL for an anonymous route's user_id; `?? undefined` folds it.
type RouteRow = Readonly<{
  id: string;
  name: string;
  region: string;
  data: string;
  public: number;
  userId: string | undefined;
  createdAt: number;
}>;

const toRoute = (row: RouteRow): SavedRoute => ({
  id: row.id,
  name: row.name,
  region: row.region,
  data: row.data,
  public: row.public === 1,
  userId: row.userId ?? undefined,
  createdAt: row.createdAt,
});

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

const SELECT_COLS = `id, user_id AS userId, name, region, data, public, created_at AS createdAt`;

/** A single route by id, for viewing (access is checked by the caller). */
export const getRoute = async (db: D1Database, id: string): Promise<SavedRoute | undefined> => {
  const row = await db.prepare(`SELECT ${SELECT_COLS} FROM saved_routes WHERE id = ?`).bind(id).first<RouteRow>();
  return row ? toRoute(row) : undefined;
};

/** A signed-in user's own saved routes, newest first. */
export const listRoutes = async (db: D1Database, userId: string): Promise<readonly SavedRoute[]> => {
  const res = await db
    .prepare(`SELECT ${SELECT_COLS} FROM saved_routes WHERE user_id = ? ORDER BY created_at DESC`)
    .bind(userId)
    .all<RouteRow>();
  return (res.results ?? []).map(toRoute);
};

/** Insert or update a route. `userId` is undefined for an anonymous route,
 *  which is always public; an owned route respects `isPublic`. */
export const saveRoute = async (
  db: D1Database,
  route: Readonly<{ id: string; userId: string | undefined; name: string; region: string; data: string; isPublic: boolean; editToken?: string }>,
  now: number,
): Promise<void> => {
  const pub = route.isPublic ? 1 : 0;
  const onConflict = `ON CONFLICT(id) DO UPDATE SET name = excluded.name, data = excluded.data, public = excluded.public`;
  // Omit user_id for an anonymous route so SQLite stores SQL NULL (D1 .bind()
  // has no undefined; omitting the column is the clean way to get a NULL owner).
  // Its edit_token is the author's device's secret key for later edits.
  if (route.userId === undefined) {
    await db
      .prepare(`INSERT INTO saved_routes (id, name, region, data, public, created_at, edit_token) VALUES (?, ?, ?, ?, ?, ?, ?) ${onConflict}`)
      .bind(route.id, route.name, route.region, route.data, pub, now, route.editToken ?? '')
      .run();
    return;
  }
  await db
    .prepare(`INSERT INTO saved_routes (id, user_id, name, region, data, public, created_at) VALUES (?, ?, ?, ?, ?, ?, ?) ${onConflict}`)
    .bind(route.id, route.userId, route.name, route.region, route.data, pub, now)
    .run();
};

/** Owner-only: flip a route's visibility. */
export const setRoutePrivacy = async (
  db: D1Database,
  userId: string,
  id: string,
  isPublic: boolean,
): Promise<void> => {
  await db
    .prepare(`UPDATE saved_routes SET public = ? WHERE id = ? AND user_id = ?`)
    .bind(isPublic ? 1 : 0, id, userId)
    .run();
};

/** Owner-only: overwrite a route's itinerary payload (an in-place edit). */
export const updateRouteData = async (
  db: D1Database,
  userId: string,
  id: string,
  data: string,
): Promise<void> => {
  await db.prepare(`UPDATE saved_routes SET data = ? WHERE id = ? AND user_id = ?`).bind(data, id, userId).run();
};

/** Edit an anonymous (owner-less) route's itinerary, authorised by its secret
 *  edit token — held only by the author's device, so a public link alone grants
 *  read access, not edit. A legacy token-less route is claimed by the first
 *  editor's token. Resolves true when a row changed (the token matched, or the
 *  route had none yet); false on a token mismatch. The `user_id IS NULL` guard
 *  ensures this can never touch an owned route. */
export const editAnonymousRoute = async (db: D1Database, id: string, data: string, token: string): Promise<boolean> => {
  const res = await db
    .prepare(`UPDATE saved_routes SET data = ?, edit_token = ? WHERE id = ? AND user_id IS NULL AND (edit_token IS NULL OR edit_token = '' OR edit_token = ?)`)
    .bind(data, token, id, token)
    .run();
  return (res.meta?.changes ?? 0) > 0;
};

export const deleteRoute = async (db: D1Database, userId: string, id: string): Promise<void> => {
  await db.prepare(`DELETE FROM saved_routes WHERE user_id = ? AND id = ?`).bind(userId, id).run();
};
