import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// One Worker per environment (Cloudflare adapter): public pages stay
// prerendered (static assets), while auth / submit / API routes opt into
// on-demand rendering via `export const prerender = false`.
// SITE_URL drives canonical URLs; defaults to the prod domain.
const siteUrl = process.env.SITE_URL ?? 'https://dovego.it';

export default defineConfig({
  site: siteUrl,
  base: '/',
  output: 'static',
  adapter: cloudflare({ platformProxy: { enabled: false }, imageService: 'compile' }),
  // The city is part of the address: a link is a place. The bare paths are kept
  // as redirects into the default city so old links (and the root) still work.
  redirects: {
    '/': '/genova/',
    '/calendar': '/genova/calendar/',
    '/map': '/genova/map/',
    '/it': '/it/genova/',
    '/it/calendar': '/it/genova/calendar/',
    '/it/map': '/it/genova/map/',
    '/ru': '/ru/genova/',
    '/ru/calendar': '/ru/genova/calendar/',
    '/ru/map': '/ru/genova/map/',
  },
  i18n: {
    locales: ['en', 'it', 'ru'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
});
