/** Owner-only: flip a route's visibility. */
export const setRoutePrivacy = async (
  db: D1Database,
  userId: string,
  id: string,
  isPublic: boolean,
): Promise<void> => {
  await db
    .prepare(`UPDATE saved_routes SET public = ? WHERE id = ? AND user_id = ?`)
    .bind(Number(isPublic), id, userId)
    .run();
};
