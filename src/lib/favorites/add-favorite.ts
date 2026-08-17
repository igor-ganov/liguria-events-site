/** Favourite an event for a user; favouriting twice is a no-op. */
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
