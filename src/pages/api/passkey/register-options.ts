import type { APIRoute } from 'astro';
import { registrationOptions } from '../../../lib/auth/passkey.ts';
import { listUserCredentials } from '../../../lib/auth/credentials.ts';
import { putChallenge } from '../../../lib/auth/challenges.ts';
import { gatedResponse } from '../../../lib/gated-response.ts';
import { jsonValue } from '../../../lib/json-value.ts';
import { passkeyAttachment } from '../../../lib/auth/passkey-attachment.ts';

export const prerender = false;

const unauthorized = () => Response.json({ error: 'unauthorized' }, { status: 401 });

/** Begin passkey registration; returns a challenge id echoed back on verify. */
export const POST: APIRoute = ({ request, locals }) =>
  gatedResponse(locals.user)(unauthorized)(async (user) => {
    const env = locals.runtime.env;
    const body = await request.json().catch(() => ({}));
    const attachment = passkeyAttachment(jsonValue(body, 'attachment'));
    const existing = await listUserCredentials(env.DB, user.id);
    const options = await registrationOptions(env.PASSKEY_RP_ID, user.id, user.email, existing, attachment);
    const challengeId = crypto.randomUUID();
    await putChallenge(env.DB, challengeId, {
      purpose: 'register',
      challenge: options.challenge,
      userId: user.id,
    });
    return Response.json({ challengeId, options });
  });
