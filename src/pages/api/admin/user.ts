import type { APIRoute } from 'astro';
import { isRootAdmin, rootAdmins } from '../../../lib/auth/users.ts';

export const prerender = false;

type Target = { id: string; email: string; handle: string };

/** Banning a person hides everything they published: the events stay in the
 *  table (authorship, audit) but drop out of every public listing. */
const banEvents = async (db: D1Database, userId: string, now: string): Promise<void> => {
  await db
    .prepare("UPDATE events SET status = 'rejected', updated_at = ? WHERE submitter_id = ?")
    .bind(now, userId)
    .run();
};

const restoreEvents = async (db: D1Database, userId: string, now: string): Promise<void> => {
  await db
    .prepare("UPDATE events SET status = 'pending', updated_at = ? WHERE submitter_id = ?")
    .bind(now, userId)
    .run();
};

const apply = async (
  db: D1Database,
  action: string,
  target: Target,
  reason: string,
  now: string,
): Promise<boolean> => {
  if (action === 'promote') {
    await db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").bind(target.id).run();
    return true;
  }
  if (action === 'demote') {
    await db.prepare("UPDATE users SET role = 'member' WHERE id = ?").bind(target.id).run();
    return true;
  }
  if (action === 'ban') {
    await db
      .prepare('UPDATE users SET banned = 1, banned_at = ?, banned_reason = ? WHERE id = ?')
      .bind(now, reason, target.id)
      .run();
    await banEvents(db, target.id, now);
    return true;
  }
  if (action === 'unban') {
    await db
      .prepare('UPDATE users SET banned = 0, banned_at = NULL, banned_reason = NULL WHERE id = ?')
      .bind(target.id)
      .run();
    // Their events go back through moderation rather than straight to public.
    await restoreEvents(db, target.id, now);
    return true;
  }
  if (action === 'delete_events') {
    await db.prepare('DELETE FROM events WHERE submitter_id = ?').bind(target.id).run();
    return true;
  }
  return false;
};

/** Admin-only: grant/revoke admin, ban/unban a person, purge their events. */
export const POST: APIRoute = async ({ request, locals }) => {
  const actor = locals.user;
  if (!actor || actor.role !== 'admin' || actor.banned) {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }
  const env = locals.runtime.env;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = typeof body.id === 'string' ? body.id : '';
  const action = typeof body.action === 'string' ? body.action : '';
  const reason = typeof body.reason === 'string' ? body.reason.slice(0, 300) : '';
  if (!id) return Response.json({ error: 'bad_request' }, { status: 400 });

  // An admin may not demote, ban or purge themselves — that is how a platform
  // ends up with nobody able to moderate it.
  if (id === actor.id) return Response.json({ error: 'self' }, { status: 400 });

  const target = await env.DB.prepare('SELECT id, email, handle FROM users WHERE id = ?')
    .bind(id)
    .first<Target>();
  if (!target) return Response.json({ error: 'not_found' }, { status: 404 });
  if (isRootAdmin(target.email, rootAdmins(env)) && action !== 'promote') {
    return Response.json({ error: 'root_admin' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const done = await apply(env.DB, action, target, reason, now);
  if (!done) return Response.json({ error: 'bad_request' }, { status: 400 });

  await env.DB.prepare(
    'INSERT INTO moderation_log (event_id, action, actor, reason, created_at) VALUES (?, ?, ?, ?, ?)',
  )
    .bind(`user:${target.id}`, `admin_${action}`, `admin:${actor.handle}`, reason, now)
    .run();

  return Response.json({ ok: true });
};
