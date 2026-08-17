/** Owner-only: overwrite a route's itinerary payload (an in-place edit). */
export const updateRouteData = async (
  db: D1Database,
  userId: string,
  id: string,
  data: string,
): Promise<void> => {
  await db
    .prepare(`UPDATE saved_routes SET data = ? WHERE id = ? AND user_id = ?`)
    .bind(data, id, userId)
    .run();
};
