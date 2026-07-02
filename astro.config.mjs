import { defineConfig } from 'astro/config';

// GitHub Pages project site — served under /liguria-events-site (AC-4.2).
export default defineConfig({
  site: 'https://igor-ganov.github.io',
  base: '/liguria-events-site',
  output: 'static',
});
