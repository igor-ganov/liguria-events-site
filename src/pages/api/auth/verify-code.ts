import type { APIRoute } from 'astro';
import { consumeMagicCode } from '../../../lib/auth/magic.ts';
import { findOrCreateUser, rootAdmins } from '../../../lib/auth/users.ts';
import { signSession, SESSION_COOKIE, sessionCookie } from '../../../lib/auth/session.ts';
import { gatedResponse } from '../../../lib/gated-response.ts';
import { jsonField } from '../../../lib/json-field.ts';

export const prerender = false;

const SIX_DIGITS = /^\d{6}$/;

const invalid = () => Response.json({ error: 'invalid' }, { status: 400 });
const unverified = () => Response.json({ ok: false }, { status: 400 });

/** Verify the emailed 6-digit code and sign in. Returns isNew for the passkey offer. */
export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const env = locals.runtime.env;
  const body = await request.json().catch(() => ({}));
  const email = (jsonField(body, 'email') ?? '').trim();
  const code = (jsonField(body, 'code') ?? '').trim();
  return gatedResponse(email, (value) => value !== '' && SIX_DIGITS.test(code))(invalid)(async (address) => {
    const verified = await consumeMagicCode(env.SESSION, address, code);
    return gatedResponse(verified ?? undefined, (subject) => subject !== '')(unverified)(async (subject) => {
      const nowMs = Date.now();
      const now = new Date(nowMs).toISOString();
      const { user, isNew } = await findOrCreateUser(env.DB, subject, now, rootAdmins(env));
      const session = await signSession(env.SESSION_SECRET, user.id, nowMs);
      cookies.set(SESSION_COOKIE, session, {
        ...sessionCookie(env.ENVIRONMENT === 'production'),
        maxAge: 7 * 24 * 3600,
      });
      return Response.json({ ok: true, isNew });
    });
  });
};
