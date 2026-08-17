/** Un-favourite an event for a user. */
export const removeFavorite = async (
  db: D1Database,
  userId: string,
  eventId: string,
): Promise<void> => {
  await db
    .prepare(`DELETE FROM favorites WHERE user_id = ? AND event_id = ?`)
    .bind(userId, eventId)
    .run();
};
