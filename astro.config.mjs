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
  // The stylesheet rides in the page. As a file of its own it was a second
  // round trip before anything could be painted — 0.7 s of a phone's first
  // paint on a slow connection — and every page links the same one anyway.
  build: { inlineStylesheets: 'always' },
    // wasmModuleImports: the link-preview card is rasterised in the worker, and
  // Workers refuse to compile WebAssembly from a buffer at runtime — the module
  // has to be bound at deploy time, which is what this import mode does.
  adapter: cloudflare({
    platformProxy: { enabled: false },
    imageService: 'compile',
    wasmModuleImports: true,
  }),
  // No sitemap integration. It wrote sitemap-0.xml over everything prerendered,
  // which is a denylist — one `filter` excluding the map view — and a denylist
  // advertises every page nobody remembered to exclude: /admin/, /admin/users/,
  // /settings/, /tickets/ and /auth/verify/ were all offered to Google as
  // content, three of them answering 302 to a sign-in. It also wrote all three
  // locales of every page, no lastmod and no hreflang, long after the
  // hand-written files had stopped doing any of that. src/pages/sitemap-*.xml.ts
  // enumerate the pages instead: an allowlist cannot leak a page it was never
  // told about.
  integrations: [],
  i18n: {
    locales: ['en', 'it', 'ru'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
});
