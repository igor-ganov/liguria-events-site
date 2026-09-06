import type { EventEnv } from './event-env.ts';
import type { DeferredWork } from '../deferred-work.ts';
import { eventSlug } from './event-slug.ts';
import { writeEventEdit } from './write-event-edit.ts';
import { jsonField } from '../json-field.ts';
import { isDefined } from '../is-defined.ts';
import { moderateAndNotify } from '../moderation/moderate-and-notify.ts';
import { parsedEventInput } from './parsed-event-input.ts';
import type { AppUser } from '../auth/types.ts';

const OWNER = 'SELECT submitter_id FROM events WHERE id = ?';

// The edit was overtaken while it waited. Answered rather than written, so the
// author can see what changed and decide, instead of finding out later that
// their save quietly undid somebody else's.
const conflict = (): Response =>
  Response.json(
    { error: 'conflict', detail: 'This event changed while your edit was waiting.' },
    { status: 409 },
  );

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
  const base = jsonField(body, 'baseUpdatedAt');
  const now = new Date().toISOString();
  const edited = await Promise.all(
    accepted.map(async (e) => {
      switch (await writeEventEdit(env, e, base, now, id, user.id)) {
        case 'conflict':
          return conflict();
      }
      await env.DB.prepare(LOG_SQL).bind(id, 'edited', `user:${user.handle}`, '', now).run();
      ctx.waitUntil(
        moderateAndNotify(env, { id, title: e.title, description: e.description, submitterEmail: user.email }),
      );
      // Retitling moves the event's address; the form follows it.
      return Response.json({ ok: true, id, slug: eventSlug({ id, t: e.title, s: e.startDate, v: e.venue ?? undefined }), status: 'pending' });
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
