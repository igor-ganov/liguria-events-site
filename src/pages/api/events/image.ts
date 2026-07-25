import type { APIRoute } from 'astro';

export const prerender = false;

// A signed-in user uploads one event image; we store the original in R2 under a
// /uploads/ path served by this zone, so Cloudflare Transformations can resize
// it on the fly (see lib/img/resized.ts). Returns the stable /uploads/<key> URL.
const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
};
const MAX_BYTES = 8 * 1024 * 1024;

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (user.banned) return Response.json({ error: 'banned' }, { status: 403 });

  const form = await request.formData().catch(() => undefined);
  const file = form?.get('file');
  if (!(file instanceof File)) return Response.json({ error: 'invalid', detail: 'No file.' }, { status: 400 });
  const ext = EXT[file.type];
  if (ext === undefined) return Response.json({ error: 'invalid', detail: 'Use a JP, PNG, WebP, AVIF or GIF image.' }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: 'invalid', detail: 'Image must be under 8 MB.' }, { status: 400 });

  const key = `ev/${crypto.randomUUID().replace(/-/g, '')}.${ext}`;
  await locals.runtime.env.UPLOADS.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type, cacheControl: 'public, max-age=31536000, immutable' },
  });
  return Response.json({ ok: true, url: `/uploads/${key}` });
};
