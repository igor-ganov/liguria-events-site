/** Owner-only: delete a saved route. */
export const deleteRoute = async (db: D1Database, userId: string, id: string): Promise<void> => {
  await db
    .prepare(`DELETE FROM saved_routes WHERE user_id = ? AND id = ?`)
    .bind(userId, id)
    .run();
};
