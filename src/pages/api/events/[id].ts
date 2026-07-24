import type { APIRoute } from 'astro';
import { moderateAndNotify } from '../../../lib/moderation/moderate-and-notify.ts';

export const prerender = false;

const str = (v: unknown, max = 4000): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isDate = (v: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(v);

/** Edit one's own event: update the fields, reset to `pending`, then re-screen
 *  with the AI and email the result — same gate as a fresh submission. */
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (user.banned) return Response.json({ error: 'banned' }, { status: 403 });
  const env = locals.runtime.env;
  const ctx = locals.runtime.ctx;
  const id = params.id ?? '';

  const owner = await env.DB.prepare('SELECT submitter_id FROM events WHERE id = ?')
    .bind(id)
    .first<{ submitter_id: string | null }>();
  if (!owner || owner.submitter_id !== user.id) {
    return Response.json({ error: 'not_found' }, { status: 404 });
  }

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

  const now = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE events SET title_en = ?, desc_en = ?, start_date = ?, end_date = ?, categories = ?,
       venue = ?, free = ?, status = 'pending', updated_at = ? WHERE id = ? AND submitter_id = ?`,
  )
    .bind(title, description, startDate, endDate || null, JSON.stringify(categories), venue || null, free ? 1 : 0, now, id, user.id)
    .run();
  await env.DB.prepare(
    'INSERT INTO moderation_log (event_id, action, actor, reason, created_at) VALUES (?, ?, ?, ?, ?)',
  )
    .bind(id, 'edited', `user:${user.handle}`, '', now)
    .run();

  ctx.waitUntil(moderateAndNotify(env, { id, title, description, submitterEmail: user.email }));

  return Response.json({ ok: true, id, status: 'pending' });
};
