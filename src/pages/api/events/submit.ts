import type { APIRoute } from 'astro';
import { moderateEvent } from '../../../lib/moderation/moderate.ts';
import { sendModerationEmail } from '../../../lib/moderation/notify.ts';

export const prerender = false;

type AiRun = { run: (model: string, input: Record<string, unknown>) => Promise<unknown> };
type Env = { AI: unknown; DB: D1Database; RESEND_API_KEY: string; MAIL_FROM: string };

const str = (v: unknown, max = 4000): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isDate = (v: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(v);

const statusFor = (verdict: 'allow' | 'hold' | 'reject'): string =>
  verdict === 'allow' ? 'published' : verdict === 'reject' ? 'rejected' : 'held';

// The post-creation moderation step (runs via waitUntil, after the response):
// AI screens the event, sets its status + gem flag, logs, and emails the result.
const moderateAndNotify = async (
  env: Env,
  ev: { id: string; title: string; description: string; submitterEmail: string },
): Promise<void> => {
  const verdict = await moderateEvent(env.AI as unknown as AiRun, ev.title, ev.description);
  const status = statusFor(verdict.verdict);
  const now = new Date().toISOString();
  await env.DB.prepare('UPDATE events SET status = ?, gem = ?, updated_at = ? WHERE id = ?')
    .bind(status, verdict.gem ? 1 : 0, now, ev.id)
    .run();
  await env.DB.prepare(
    'INSERT INTO moderation_log (event_id, action, actor, reason, created_at) VALUES (?, ?, ?, ?, ?)',
  )
    .bind(ev.id, `ai_${verdict.verdict}`, 'ai', verdict.reason, now)
    .run();
  await sendModerationEmail(env.RESEND_API_KEY, env.MAIL_FROM, ev.submitterEmail, ev.title, status, verdict.reason);
};

/** Submit an event: create it as `pending`, then AI-moderate + email the result
 *  asynchronously. The "hidden gem" flag is decided by the AI, not the user. */
export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (user.banned) return Response.json({ error: 'banned' }, { status: 403 });
  const env = locals.runtime.env;
  const ctx = locals.runtime.ctx;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const title = str(body.title, 200);
  const description = str(body.description);
  const startDate = str(body.startDate, 10);
  const endDate = str(body.endDate, 10);
  const venue = str(body.venue, 200);
  const categories = Array.isArray(body.categories)
    ? body.categories.filter((c): c is string => typeof c === 'string').slice(0, 6)
    : [];
  const free = body.free === true;

  if (title.length < 3 || !isDate(startDate)) {
    return Response.json({ error: 'invalid', detail: 'Title and a valid start date are required.' }, { status: 400 });
  }
  if (endDate && !isDate(endDate)) {
    return Response.json({ error: 'invalid', detail: 'End date is malformed.' }, { status: 400 });
  }

  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  const now = new Date().toISOString();

  // Create as pending — gem is 0 until the AI decides; moderation publishes it.
  await env.DB.prepare(
    `INSERT INTO events
       (id, origin, submitter_id, status, title_en, desc_en, start_date, end_date,
        categories, venue, free, gem, created_at, updated_at)
     VALUES (?, 'user', ?, 'pending', ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
  )
    .bind(id, user.id, title, description, startDate, endDate || null, JSON.stringify(categories), venue || null, free ? 1 : 0, now, now)
    .run();
  await env.DB.prepare(
    'INSERT INTO moderation_log (event_id, action, actor, reason, created_at) VALUES (?, ?, ?, ?, ?)',
  )
    .bind(id, 'submitted', `user:${user.handle}`, '', now)
    .run();

  ctx.waitUntil(moderateAndNotify(env, { id, title, description, submitterEmail: user.email }));

  return Response.json({ ok: true, status: 'pending' });
};
