import type { APIRoute } from 'astro';
import { moderateEvent } from '../../../lib/moderation/moderate.ts';

export const prerender = false;

type AiRun = { run: (model: string, input: Record<string, unknown>) => Promise<{ response?: string }> };

const str = (v: unknown, max = 4000): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isDate = (v: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(v);

const statusFor = (verdict: 'allow' | 'hold' | 'reject'): string =>
  verdict === 'allow' ? 'published' : verdict === 'reject' ? 'rejected' : 'held';

/** Submit an event: authenticated, AI-moderated, stored in D1 with an audit row. */
export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const env = locals.runtime.env;

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
  const gem = body.gem === true;

  if (title.length < 3 || !isDate(startDate)) {
    return Response.json({ error: 'invalid', detail: 'Title and a valid start date are required.' }, { status: 400 });
  }
  if (endDate && !isDate(endDate)) {
    return Response.json({ error: 'invalid', detail: 'End date is malformed.' }, { status: 400 });
  }

  const verdict = await moderateEvent(env.AI as unknown as AiRun, title, description);
  const status = statusFor(verdict.verdict);
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO events
       (id, origin, submitter_id, status, title_en, desc_en, start_date, end_date,
        categories, venue, free, gem, created_at, updated_at)
     VALUES (?, 'user', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id, user.id, status, title, description, startDate, endDate || null,
      JSON.stringify(categories), venue || null, free ? 1 : 0, gem ? 1 : 0, now, now,
    )
    .run();

  await env.DB.prepare(
    'INSERT INTO moderation_log (event_id, action, actor, reason, created_at) VALUES (?, ?, ?, ?, ?)',
  )
    .bind(id, `ai_${verdict.verdict}`, 'ai', verdict.reason, now)
    .run();

  return Response.json({ ok: true, id, status, reason: verdict.reason });
};
