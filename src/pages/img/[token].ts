import type { APIRoute } from 'astro';
import { allowedImageSource } from '../../lib/img/allowed-image-source.ts';
import { decodeImageSource } from '../../lib/img/decode-image-source.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { proxiedImageResponse } from '../../lib/img/proxied-image-response.ts';

export const prerender = false;

// Puts a source image on our own origin so Cloudflare Transformations — which
// this zone allows for same-origin paths only — can crop it to a link preview.
// The host allowlist is the whole security story: without it the route is a
// free bandwidth relay for anyone who reads the page source.
export const GET: APIRoute = async ({ params }) =>
  [decodeImageSource(params.token ?? '')]
    .filter(isDefined)
    .filter(allowedImageSource)
    .map(proxiedImageResponse)
    .at(0) ?? new Response('Not an image we serve', { status: 400 });
