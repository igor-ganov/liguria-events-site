import { needsAuth } from './needs-auth.ts';

/** Only what the gate reads off the session user. */
type GateUser = Readonly<{ banned?: boolean | undefined }>;

/**
 * Where a request to a protected path must be bounced, or undefined to let it
 * through. Order is significant and matches the guards this replaced:
 *
 * 1. a BANNED signed-in person is sent to the notice — they stay signed in so
 *    they can see why, but may not reach anything that writes;
 * 2. an anonymous visitor is sent home with the sign-in dialog armed, carrying
 *    the path they wanted so it can resume afterwards (there is no login page).
 *
 * Both conditions use truthiness on `user`, exactly as before.
 */
export const authGate = (path: string, user: GateUser | undefined): string | undefined => {
  const gated = needsAuth(path);
  const bannedFirst = [gated && Boolean(user?.banned)].filter(Boolean).map(() => '/?banned=1');
  const thenAnonymous = [gated && !user]
    .filter(Boolean)
    .map(() => `/?signin=1&next=${encodeURIComponent(path)}`);
  return [...bannedFirst, ...thenAnonymous].at(0);
};
