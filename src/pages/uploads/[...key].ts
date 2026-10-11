import type { APIRoute } from 'astro';
import { edgeCached } from '../../lib/http/edge-cached.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { isRewrittenUpload } from '../../lib/img/is-rewritten-upload.ts';
import { uploadHeaders } from '../../lib/img/upload-headers.ts';
import type { EdgeStore } from '../../lib/http/edge-cached.ts';

export const prerender = false;

// A named cache rather than the default one: it is the same cache of the same
// place, under the name the standard types know how to open.
const edge = (): EdgeStore => ({
  match: async (key) => (await caches.open('uploads')).match(key),
  put: async (key, response) => (await caches.open('uploads')).put(key, response),
});

// Serve a stored file from R2. It lives on the dovego.it zone so Cloudflare
// Transformations (/cdn-cgi/image/...) can resize it on demand. A file named
// after its content is kept by the cache of the place it was asked from; one
// that is written over under the same name is read from the bucket each time.
export const GET: APIRoute = ({ params, locals, request }) => {
  const key = params.key ?? '';
  const store = [key].filter((name) => !isRewrittenUpload(name)).map(edge).at(0);
  return edgeCached(store, request.url, locals.runtime.ctx, async () => {
    const object = await locals.runtime.env.UPLOADS.get(key);
    return (
      [object ?? undefined]
        .filter(isDefined)
        .map((found) => new Response(found.body, { headers: uploadHeaders(found, key) }))
        .at(0) ?? new Response('Not found', { status: 404 })
    );
  });
};
