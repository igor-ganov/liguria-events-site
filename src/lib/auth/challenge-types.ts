/** A single-use WebAuthn challenge, as handed to and taken from D1. */
export type Challenge = Readonly<{ purpose: 'register' | 'auth'; challenge: string; userId?: string }>;

/** The stored row. `user_id` keeps the database's own empty marker because the
 *  D1 driver returns it verbatim for a NULL column. */
export type ChallengeRow = Readonly<{
  purpose: string;
  user_id: string | null;
  challenge: string;
  expires_at: number;
}>;
