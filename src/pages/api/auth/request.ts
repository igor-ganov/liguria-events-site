import type { APIRoute } from 'astro';
import { issueMagicToken } from '../../../lib/auth/magic.ts';
import { sendMagicLink } from '../../../lib/auth/email.ts';

export const prerender = false;

const isEmail = (value: string): boolean => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);

/** Request a sign-in link. Always reports success (no account enumeration). */
export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!isEmail(email)) return Response.json({ error: 'invalid_email' }, { status: 400 });

  const token = await issueMagicToken(env.SESSION, email);
  if (token) {
    const link = `${env.PUBLIC_ORIGIN}/auth/verify?t=${token}`;
    await sendMagicLink(env.RESEND_API_KEY, env.MAIL_FROM, email, link);
  }
  return Response.json({ ok: true });
};
