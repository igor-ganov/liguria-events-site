import type { APIRoute } from 'astro';
import { authenticationOptions } from '../../../lib/auth/passkey.ts';
import { putChallenge } from '../../../lib/auth/challenges.ts';

export const prerender = false;

/** Begin passkey sign-in (discoverable credentials); returns a challenge id. */
export const POST: APIRoute = async ({ locals }) => {
  const env = locals.runtime.env;
  const options = await authenticationOptions(env.PASSKEY_RP_ID, []);
  const challengeId = crypto.randomUUID();
  await putChallenge(env.DB, challengeId, { purpose: 'auth', challenge: options.challenge });
  return Response.json({ challengeId, options });
};
