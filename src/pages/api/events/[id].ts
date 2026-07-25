import type { APIRoute } from 'astro';
import { moderateAndNotify } from '../../../lib/moderation/moderate-and-notify.ts';
import { parseEventInput } from '../../../lib/events/event-input.ts';

export const prerender = false;

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
  const parsed = parseEventInput(body);
  if (!parsed.ok) return Response.json({ error: 'invalid', detail: parsed.detail }, { status: 400 });
  const e = parsed.value;

  const now = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE events SET title_en = ?, desc_en = ?, start_date = ?, end_date = ?, categories = ?,
       venue = ?, address = ?, phone = ?, website = ?, cover_image = ?, lat = ?, lng = ?, free = ?,
       status = 'pending', updated_at = ? WHERE id = ? AND submitter_id = ?`,
  )
    .bind(e.title, e.description, e.startDate, e.endDate, e.categoriesJson, e.venue, e.address, e.phone, e.website, e.cover, e.lat, e.lng, e.free, now, id, user.id)
    .run();
  await env.DB.prepare(
    'INSERT INTO moderation_log (event_id, action, actor, reason, created_at) VALUES (?, ?, ?, ?, ?)',
  )
    .bind(id, 'edited', `user:${user.handle}`, '', now)
    .run();

  ctx.waitUntil(moderateAndNotify(env, { id, title: e.title, description: e.description, submitterEmail: user.email }));

  return Response.json({ ok: true, id, status: 'pending' });
};
