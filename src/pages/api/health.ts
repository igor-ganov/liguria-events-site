import type { APIRoute } from 'astro';

export const prerender = false;

/** Liveness + which environment/clock this Worker is running. */
export const GET: APIRoute = ({ locals }) => {
  const env = locals.runtime?.env ?? {};
  return Response.json({
    ok: true,
    environment: env.ENVIRONMENT ?? 'unknown',
    pinnedToday: env.FIXED_TODAY ?? null,
    crawler: env.CRAWLER_ENABLED ?? null,
  });
};
