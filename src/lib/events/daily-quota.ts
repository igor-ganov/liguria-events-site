const SQL = "SELECT COUNT(*) AS n FROM events WHERE submitter_id = ? AND created_at >= ?";

/** How many this account has already made today, counted from midnight UTC.
 *  A day boundary that moves with the viewer's timezone would let the same
 *  account spend the same allowance twice by changing its clock. */
export const createdToday = async (db: D1Database, userId: string, now: Date): Promise<number> => {
  const since = `${now.toISOString().slice(0, 10)}T00:00:00`;
  const row = await db.prepare(SQL).bind(userId, since).first<{ n: number }>();
  return row?.n ?? 0;
};
