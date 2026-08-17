const SQL = 'UPDATE passkey_credentials SET sign_count = ?, last_used_at = ? WHERE credential_id = ?';

/** Record the signature counter reported by a successful assertion. */
export const bumpCounter = async (
  db: D1Database,
  credentialId: string,
  counter: number,
  nowIso: string,
): Promise<void> => {
  await db.prepare(SQL).bind(counter, nowIso, credentialId).run();
};
