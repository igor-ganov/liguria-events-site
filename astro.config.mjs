import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

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
  // Emits sitemap-index.xml + sitemap-0.xml over the prerendered routes. SSR
  // event detail pages (prerender = false) are intentionally excluded.
  // The map is an application view, not a page anybody should land on from a
  // search result — 60 near-identical entries would be the bulk of the file.
  integrations: [sitemap({ filter: (page) => !page.endsWith('/map/') })],
  i18n: {
    locales: ['en', 'it', 'ru'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
});
