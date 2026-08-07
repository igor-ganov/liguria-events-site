import type { APIRoute } from 'astro';
import { deleteRoute, listRoutes, saveRoute } from '../../lib/favorites/favorites-db.ts';

export const prerender = false;

const str = (v: unknown, max: number): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** The signed-in user's saved routes (empty for anonymous — they use localStorage). */
export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ routes: [] });
  return Response.json({ routes: await listRoutes(locals.runtime.env.DB, user.id) });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = str(body.id, 40) || `r${Date.now().toString(36)}`;
  const name = str(body.name, 120) || 'Route';
  const data = str(body.data, 20000);
  if (data === '') return Response.json({ error: 'invalid' }, { status: 400 });
  await saveRoute(locals.runtime.env.DB, user.id, { id, name, data }, Date.now());
  return Response.json({ ok: true, id });
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = str(body.id, 40);
  if (id === '') return Response.json({ error: 'invalid' }, { status: 400 });
  await deleteRoute(locals.runtime.env.DB, user.id, id);
  return Response.json({ ok: true });
};
