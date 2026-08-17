import type { EventEnv } from './event-env.ts';
import type { DeferredWork } from '../deferred-work.ts';
import { isDefined } from '../is-defined.ts';
import { moderateAndNotify } from '../moderation/moderate-and-notify.ts';
import { parsedEventInput } from './parsed-event-input.ts';
import type { AppUser } from '../auth/types.ts';

const OWNER = 'SELECT submitter_id FROM events WHERE id = ?';

const UPDATE = `UPDATE events SET title_en = ?, desc_en = ?, start_date = ?, end_date = ?, categories = ?,
       venue = ?, address = ?, phone = ?, website = ?, cover_image = ?, lat = ?, lng = ?, free = ?,
       status = 'pending', updated_at = ? WHERE id = ? AND submitter_id = ?`;

const LOG_SQL = 'INSERT INTO moderation_log (event_id, action, actor, reason, created_at) VALUES (?, ?, ?, ?, ?)';

const applyEdit = async (
  env: EventEnv,
  ctx: DeferredWork,
  user: AppUser,
  id: string,
  request: Request,
): Promise<Response> => {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const { accepted, rejection } = parsedEventInput(body);
  const now = new Date().toISOString();
  const edited = await Promise.all(
    accepted.map(async (e) => {
      await env.DB.prepare(UPDATE)
        .bind(e.title, e.description, e.startDate, e.endDate, e.categoriesJson, e.venue, e.address, e.phone, e.website, e.cover, e.lat, e.lng, e.free, now, id, user.id)
        .run();
      await env.DB.prepare(LOG_SQL).bind(id, 'edited', `user:${user.handle}`, '', now).run();
      ctx.waitUntil(
        moderateAndNotify(env, { id, title: e.title, description: e.description, submitterEmail: user.email }),
      );
      return Response.json({ ok: true, id, status: 'pending' });
    }),
  );
  return edited.at(0) ?? rejection();
};

/** Edit one's own event: update the fields, reset to `pending`, then re-screen
 *  with the AI and email the result — same gate as a fresh submission. A 0-or-1
 *  owner: somebody else's event, or none at all, is a 404 and nothing is read. */
export const editEvent = async (
  env: EventEnv,
  ctx: DeferredWork,
  user: AppUser,
  id: string,
  request: Request,
): Promise<Response> => {
  // The row keeps the database's own empty marker: the D1 driver returns it
  // verbatim for a NULL column, and an id never compares equal to it either way.
  const owner = await env.DB.prepare(OWNER).bind(id).first<{ submitter_id: string | null }>();
  const answers = await Promise.all(
    [owner ?? undefined]
      .filter(isDefined)
      .filter((row) => row.submitter_id === user.id)
      .map(() => applyEdit(env, ctx, user, id, request)),
  );
  return answers.at(0) ?? Response.json({ error: 'not_found' }, { status: 404 });
};
