/** The user's favourite event ids, newest first. */
export const listFavorites = async (db: D1Database, userId: string): Promise<readonly string[]> => {
  const res = await db
    .prepare(`SELECT event_id AS id FROM favorites WHERE user_id = ? ORDER BY added_at DESC`)
    .bind(userId)
    .all<{ id: string }>();
  return (res.results ?? []).map((row) => row.id);
};
