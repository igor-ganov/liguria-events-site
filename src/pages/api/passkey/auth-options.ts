import type { APIRoute } from 'astro';
import { authenticationOptions } from '../../../lib/auth/passkey.ts';
import { putChallenge } from '../../../lib/auth/challenges.ts';

export const prerender = false;

/** Begin passkey sign-in (discoverable credentials — no email needed). */
export const POST: APIRoute = async ({ locals }) => {
  const env = locals.runtime.env;
  const options = await authenticationOptions(env.PASSKEY_RP_ID, []);
  const sessionId = crypto.randomUUID();
  await putChallenge(env.SESSION, `auth:${sessionId}`, { challenge: options.challenge, purpose: 'auth' });
  return Response.json({ options, sessionId });
};
