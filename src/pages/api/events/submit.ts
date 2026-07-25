import type { APIRoute } from 'astro';
import { moderateAndNotify } from '../../../lib/moderation/moderate-and-notify.ts';
import { parseEventInput } from '../../../lib/events/event-input.ts';

export const prerender = false;

/** Submit an event: create it as `pending`, then AI-moderate + email the result
 *  asynchronously. The "hidden gem" flag is decided by the AI, not the user. */
export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (user.banned) return Response.json({ error: 'banned' }, { status: 403 });
  const env = locals.runtime.env;
  const ctx = locals.runtime.ctx;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const parsed = parseEventInput(body);
  if (!parsed.ok) return Response.json({ error: 'invalid', detail: parsed.detail }, { status: 400 });
  const e = parsed.value;

  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  const now = new Date().toISOString();

  // Create as pending — gem is 0 until the AI decides; moderation publishes it.
  await env.DB.prepare(
    `INSERT INTO events
       (id, origin, submitter_id, status, title_en, desc_en, start_date, end_date,
        categories, venue, address, phone, website, cover_image, lat, lng, free, gem, created_at, updated_at)
     VALUES (?, 'user', ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
  )
    .bind(id, user.id, e.title, e.description, e.startDate, e.endDate, e.categoriesJson, e.venue, e.address, e.phone, e.website, e.cover, e.lat, e.lng, e.free, now, now)
    .run();
  await env.DB.prepare(
    'INSERT INTO moderation_log (event_id, action, actor, reason, created_at) VALUES (?, ?, ?, ?, ?)',
  )
    .bind(id, 'submitted', `user:${user.handle}`, '', now)
    .run();

  ctx.waitUntil(moderateAndNotify(env, { id, title: e.title, description: e.description, submitterEmail: user.email }));

  return Response.json({ ok: true, id, status: 'pending' });
};
