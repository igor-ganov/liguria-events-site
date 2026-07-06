import type { APIRoute } from 'astro';

export const prerender = false;

const ACTIONS: Record<string, { status?: string; del?: boolean; log: string }> = {
  publish: { status: 'published', log: 'admin_publish' },
  reject: { status: 'rejected', log: 'admin_reject' },
  delete: { del: true, log: 'admin_delete' },
};

/** Admin-only: publish / reject / delete an event, with an audit row. */
export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') return Response.json({ error: 'forbidden' }, { status: 403 });
  const env = locals.runtime.env;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = typeof body.id === 'string' ? body.id : '';
  const action = typeof body.action === 'string' ? body.action : '';
  const spec = ACTIONS[action];
  if (!id || !spec) return Response.json({ error: 'bad_request' }, { status: 400 });

  const now = new Date().toISOString();
  if (spec.del) {
    await env.DB.prepare('DELETE FROM events WHERE id = ?').bind(id).run();
  } else {
    await env.DB.prepare('UPDATE events SET status = ?, updated_at = ? WHERE id = ?')
      .bind(spec.status, now, id)
      .run();
  }
  await env.DB.prepare(
    'INSERT INTO moderation_log (event_id, action, actor, reason, created_at) VALUES (?, ?, ?, ?, ?)',
  )
    .bind(id, spec.log, `admin:${user.handle}`, '', now)
    .run();

  return Response.json({ ok: true });
};
