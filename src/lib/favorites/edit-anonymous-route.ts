const SQL = `UPDATE saved_routes SET data = ?, edit_token = ? WHERE id = ? AND user_id IS NULL AND (edit_token IS NULL OR edit_token = '' OR edit_token = ?)`;

/** Edit an anonymous (owner-less) route's itinerary, authorised by its secret
 *  edit token — held only by the author's device, so a public link alone grants
 *  read access, not edit. A legacy token-less route is claimed by the first
 *  editor's token. Resolves true when a row changed (the token matched, or the
 *  route had none yet); false on a token mismatch. The `user_id IS NULL` guard
 *  ensures this can never touch an owned route. */
export const editAnonymousRoute = async (
  db: D1Database,
  id: string,
  data: string,
  token: string,
): Promise<boolean> => {
  const res = await db.prepare(SQL).bind(data, token, id, token).run();
  return (res.meta?.changes ?? 0) > 0;
};
