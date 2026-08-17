import { branch } from '../branch.ts';
import { consumeMagicToken } from './magic.ts';
import { findOrCreateUser } from './users.ts';
import { rootAdmins } from './root-admins.ts';
import { signSession } from './session.ts';

/** The bindings a magic-link landing needs. */
type SigninEnv = Readonly<{
  SESSION: KVNamespace;
  DB: D1Database;
  SESSION_SECRET: string;
  ADMIN_EMAILS?: string;
}>;

/** A completed sign-in: the session to set, and where to land. */
export type MagicSignin = Readonly<{ session: string; target: string }>;

/**
 * Spend a magic-link token and sign the person in. Returns undefined when the
 * token is spent, unknown or malformed — the caller then leaves the request
 * alone so the "link expired" page renders.
 *
 * The token is consumed exactly once (that is what makes a spent link fail), so
 * this must run once per request and only for the landing URL.
 */
export const magicLinkSignin = async (
  env: SigninEnv,
  token: string,
  nowMs: number,
): Promise<MagicSignin | undefined> => {
  const emails = [await consumeMagicToken(env.SESSION, token)].filter(
    (email): email is string => Boolean(email),
  );
  const signedIn = await Promise.all(
    emails.map(async (email) => {
      const nowIso = new Date(nowMs).toISOString();
      const { user, isNew } = await findOrCreateUser(env.DB, email, nowIso, rootAdmins(env));
      const session = await signSession(env.SESSION_SECRET, user.id, nowMs);
      // A first-time account is offered a passkey on the home page.
      return { session, target: branch(isNew)(() => '/?setup=passkey', () => '/') };
    }),
  );
  return signedIn.at(0);
};
