import { appManifest } from '../lib/pwa/app-manifest.ts';
import type { APIRoute } from 'astro';

// Emitted at build time: the manifest says nothing that depends on the request.
export const prerender = true;

// application/manifest+json is not decoration — a manifest served as
// application/json is fetched and then ignored, with no error anywhere.
export const GET: APIRoute = () =>
  new Response(JSON.stringify(appManifest(), undefined, 2), {
    headers: { 'content-type': 'application/manifest+json; charset=utf-8' },
  });
