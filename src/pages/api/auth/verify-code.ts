import type { APIRoute } from 'astro';
import { consumeMagicCode } from '../../../lib/auth/magic.ts';
import { findOrCreateUser, rootAdmins } from '../../../lib/auth/users.ts';
import { signSession, SESSION_COOKIE } from '../../../lib/auth/session.ts';

export const prerender = false;

/** Verify the emailed 6-digit code and sign in. Returns isNew for the passkey offer. */
export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const env = locals.runtime.env;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const code = typeof body.code === 'string' ? body.code.trim() : '';
  if (!email || !/^\d{6}$/.test(code)) return Response.json({ error: 'invalid' }, { status: 400 });

  const verified = await consumeMagicCode(env.SESSION, email, code);
  if (!verified) return Response.json({ ok: false }, { status: 400 });

  const nowMs = Date.now();
  const { user, isNew } = await findOrCreateUser(env.DB, verified, new Date(nowMs).toISOString(), rootAdmins(env));
  const session = await signSession(env.SESSION_SECRET, user.id, nowMs);
  cookies.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 3600,
  });
  return Response.json({ ok: true, isNew });
};
