import type { APIRoute } from 'astro';

export const prerender = false;

// Serve a user-uploaded image from R2. It lives on the dovego.it zone so
// Cloudflare Transformations (/cdn-cgi/image/...) can resize it on demand.
export const GET: APIRoute = async ({ params, locals }) => {
  const key = params.key ?? '';
  const object = await locals.runtime.env.UPLOADS.get(key);
  if (object === null) return new Response('Not found', { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  return new Response(object.body, { headers });
};
