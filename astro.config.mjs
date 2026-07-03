import { defineConfig } from 'astro/config';

// GitHub Pages project site — served under /liguria-events-site (AC-4.2).
// i18n: en at /, it at /it/, ru at /ru/ (i18n design §1).
export default defineConfig({
  site: 'https://igor-ganov.github.io',
  base: '/liguria-events-site',
  output: 'static',
  i18n: {
    locales: ['en', 'it', 'ru'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
});
