const SQL = 'DELETE FROM place_reviews WHERE user_id = ? AND place_id = ?';

/** Remove the user's own review for a place. */
export const deletePlaceReview = async (db: D1Database, userId: string, placeId: string): Promise<void> => {
  await db.prepare(SQL).bind(userId, placeId).run();
};
