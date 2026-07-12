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
  // The region is part of the address: a link is a place. The bare paths are
  // kept as redirects into the default region so old links (and the root) still
  // work.
  //
  // These are 302, deliberately. A 301 is cached by the browser forever: the
  // site briefly redirected "/" to "/genova/", and when the city URLs became
  // region URLs, every browser that had seen it went on following its cached
  // 301 to a page that no longer existed. A redirect that may change is not
  // permanent.
  redirects: {
    '/': { status: 302, destination: '/liguria/' },
    '/calendar': { status: 302, destination: '/liguria/calendar/' },
    '/map': { status: 302, destination: '/liguria/map/' },
    '/it': { status: 302, destination: '/it/liguria/' },
    '/it/calendar': { status: 302, destination: '/it/liguria/calendar/' },
    '/it/map': { status: 302, destination: '/it/liguria/map/' },
    '/ru': { status: 302, destination: '/ru/liguria/' },
    '/ru/calendar': { status: 302, destination: '/ru/liguria/calendar/' },
    '/ru/map': { status: 302, destination: '/ru/liguria/map/' },

    // The legacy city URLs are splat rules, which Astro's static build cannot
    // express — they live in public/_redirects, which the adapter appends to.
  },
  i18n: {
    locales: ['en', 'it', 'ru'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
});
