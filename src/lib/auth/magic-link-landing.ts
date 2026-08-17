import { magicLinkSignin } from './magic-link-signin.ts';
import type { MagicSignin } from './magic-link-signin.ts';

/** The bindings the landing needs; absent in a non-Cloudflare dev context. */
type LandingEnv = Readonly<{
  SESSION: KVNamespace;
  DB: D1Database;
  SESSION_SECRET: string;
  ADMIN_EMAILS?: string;
}>;

/** The one URL a magic link points at. */
const LANDING_PATH = '/auth/verify';

/**
 * A 0-or-1 list: the completed sign-in when this request IS a magic-link
 * landing with a usable token, empty otherwise. A list rather than an optional
 * so the caller can drive its cookie and redirect off it branch-free.
 *
 * Gated on the exact path so the token is never spent on any other request.
 */
export const magicLinkLanding = async (
  env: LandingEnv | undefined,
  url: URL,
  nowMs: number,
): Promise<readonly MagicSignin[]> => {
  const landings = [{ env, token: url.searchParams.get('t') ?? '' }].filter(
    (candidate): candidate is { env: LandingEnv; token: string } =>
      url.pathname === LANDING_PATH && Boolean(candidate.env) && candidate.token !== '',
  );
  const results = await Promise.all(
    landings.map(({ env: bindings, token }) => magicLinkSignin(bindings, token, nowMs)),
  );
  return results.filter((result): result is MagicSignin => result !== undefined);
};
