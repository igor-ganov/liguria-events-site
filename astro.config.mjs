import { defineConfig } from 'astro/config';

// Custom domain dovego.it — served at the site root.
// i18n: en at /, it at /it/, ru at /ru/ (i18n design §1).
export default defineConfig({
  site: 'https://dovego.it',
  base: '/',
  output: 'static',
  i18n: {
    locales: ['en', 'it', 'ru'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
});
