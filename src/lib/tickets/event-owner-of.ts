const SQL = 'SELECT u.handle AS handle FROM event_owners o JOIN users u ON u.id = o.user_id WHERE o.event_id = ?';

/** The handle of the reader an event was handed to, when a claim was approved. */
export const eventOwnerOf = async (db: D1Database, eventId: string): Promise<string | undefined> =>
  (await db.prepare(SQL).bind(eventId).first<{ handle: string }>())?.handle;
