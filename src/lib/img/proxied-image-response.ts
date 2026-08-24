import { branch } from '../branch.ts';

const CACHE = 'public, max-age=86400, s-maxage=604800';
const TYPES: readonly string[] = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

/** Fetch a source image and hand the bytes on. The content type is checked
 *  because "the host is one we know" does not promise the URL is an image, and
 *  passing an unknown body through under our own origin is how a proxy turns
 *  into a hosting service. */
export const proxiedImageResponse = async (src: string): Promise<Response> => {
  const upstream = await fetch(src);
  const type = (upstream.headers.get('content-type') ?? '').split(';')[0]?.trim() ?? '';
  return branch(upstream.ok && TYPES.includes(type))<Response>(
    () => new Response(upstream.body, { headers: { 'content-type': type, 'cache-control': CACHE } }),
    () => new Response('Upstream did not return an image', { status: 502 }),
  );
};
