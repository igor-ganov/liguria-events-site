import type { APIRoute } from 'astro';
import { registrationOptions } from '../../../lib/auth/passkey.ts';
import { listUserCredentials } from '../../../lib/auth/credentials.ts';
import { putChallenge } from '../../../lib/auth/challenges.ts';

export const prerender = false;

/** Begin passkey registration for the signed-in user. */
export const POST: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const env = locals.runtime.env;
  const existing = await listUserCredentials(env.DB, user.id);
  const options = await registrationOptions(env.PASSKEY_RP_ID, user.id, user.email, existing);
  await putChallenge(env.SESSION, `reg:${user.id}`, {
    challenge: options.challenge,
    purpose: 'register',
    userId: user.id,
  });
  return Response.json(options);
};
