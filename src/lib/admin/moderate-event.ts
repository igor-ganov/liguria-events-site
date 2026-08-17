import { eventAction, type EventAction } from './event-action.ts';
import { isDefined } from '../is-defined.ts';
import { jsonField } from '../json-field.ts';
import type { AppUser } from '../auth/types.ts';

const LOG_SQL = 'INSERT INTO moderation_log (event_id, action, actor, reason, created_at) VALUES (?, ?, ?, ?, ?)';

const run = async (db: D1Database, actor: AppUser, id: string, action: EventAction): Promise<Response> => {
  const now = new Date().toISOString();
  await db
    .prepare(action.sql)
    .bind(...action.bindings(id, now))
    .run();
  await db.prepare(LOG_SQL).bind(id, action.log, `admin:${actor.handle}`, '', now).run();
  return Response.json({ ok: true });
};

/** Publish / reject / delete one event, with an audit row. A 0-or-1 action: a
 *  missing id or an unknown action changes nothing and is a 400, exactly as the
 *  endpoint's own guard clause had it. */
export const moderateEvent = async (db: D1Database, actor: AppUser, request: Request): Promise<Response> => {
  const body = await request.json().catch(() => ({}));
  const id = jsonField(body, 'id') ?? '';
  const done = await Promise.all(
    [eventAction(jsonField(body, 'action') ?? '')]
      .filter(isDefined)
      .filter(() => id !== '')
      .map((action) => run(db, actor, id, action)),
  );
  return done.at(0) ?? Response.json({ error: 'bad_request' }, { status: 400 });
};
