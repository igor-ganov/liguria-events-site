import type { APIRoute } from 'astro';

export const prerender = false;

/** Current signed-in user (resolved by middleware), or null. */
export const GET: APIRoute = ({ locals }) => {
  const user = locals.user;
  return Response.json({
    user: user ? { email: user.email, handle: user.handle, role: user.role } : null,
  });
};
