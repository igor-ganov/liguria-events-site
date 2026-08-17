const SQL = 'DELETE FROM passkey_credentials WHERE credential_id = ? AND user_id = ?';

/** Delete a passkey, scoped to its owner (a user can't delete another's). */
export const deleteCredential = async (db: D1Database, userId: string, credentialId: string): Promise<void> => {
  await db.prepare(SQL).bind(credentialId, userId).run();
};
