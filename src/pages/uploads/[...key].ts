import type { APIRoute } from 'astro';
import { isDefined } from '../../lib/is-defined.ts';
import { uploadHeaders } from '../../lib/img/upload-headers.ts';

export const prerender = false;

// Serve a user-uploaded image from R2. It lives on the dovego.it zone so
// Cloudflare Transformations (/cdn-cgi/image/...) can resize it on demand.
export const GET: APIRoute = async ({ params, locals }) => {
  const key = params.key ?? '';
  const object = await locals.runtime.env.UPLOADS.get(key);
  return (
    [object ?? undefined]
      .filter(isDefined)
      .map((found) => new Response(found.body, { headers: uploadHeaders(found) }))
      .at(0) ?? new Response('Not found', { status: 404 })
  );
};
