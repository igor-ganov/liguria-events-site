import type { APIRoute } from 'astro';
import { registrationOptions } from '../../../lib/auth/passkey.ts';
import { listUserCredentials } from '../../../lib/auth/credentials.ts';
import { putChallenge } from '../../../lib/auth/challenges.ts';

export const prerender = false;

/** Begin passkey registration; returns a challenge id echoed back on verify. */
export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const env = locals.runtime.env;
  const body = (await request.json().catch(() => ({}))) as { attachment?: string };
  const attachment = body.attachment === 'platform' || body.attachment === 'cross-platform' ? body.attachment : undefined;
  const existing = await listUserCredentials(env.DB, user.id);
  const options = await registrationOptions(env.PASSKEY_RP_ID, user.id, user.email, existing, attachment);
  const challengeId = crypto.randomUUID();
  await putChallenge(env.DB, challengeId, { purpose: 'register', challenge: options.challenge, userId: user.id });
  return Response.json({ challengeId, options });
};
