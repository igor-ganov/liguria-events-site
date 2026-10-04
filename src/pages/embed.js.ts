import { embedScript } from '../lib/embed/embed-script.ts';
import type { APIRoute } from 'astro';

// One line on a venue's site. Served from here rather than a CDN so the origin
// in the iframe URL is always the one that serves the script.
export const prerender = true;

export const GET: APIRoute = ({ site }) =>
  new Response(embedScript(new URL(site ?? 'https://dovego.it').origin), {
    headers: {
      'content-type': 'text/javascript; charset=utf-8',
      'cache-control': 'public, max-age=3600',
      'access-control-allow-origin': '*',
    },
  });
