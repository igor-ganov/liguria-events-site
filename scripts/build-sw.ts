// The service worker is bundled, not hand-written into public/, so its routing
// table is the same module the unit tests run against. A worker whose rules
// were retyped by hand would drift from the tests that claim to cover them.
//
// Output is a single file with no imports, so it registers as a classic
// worker — module workers are still not supported everywhere.
import { PRECACHE_URLS } from '../src/sw/precache-urls.ts';
import { precacheStamp } from '../src/lib/pwa/precache-stamp.ts';
import { rm } from 'node:fs/promises';

await rm('public/sw.js', { force: true });

const built = await Bun.build({
  entrypoints: ['src/sw/service-worker.ts'],
  target: 'browser',
  format: 'esm',
  minify: true,
});

built.logs.filter((log) => log.level === 'error').forEach((log) => process.stderr.write(`${log}\n`));
process.exitCode = [built.success].filter((ok) => !ok).length;

// The stamp is appended so that changing what the worker PRECACHES changes the
// worker itself. A browser reinstalls a service worker only when its own file
// differs, and only an install refreshes the precache — so without this a new
// offline page ships to nobody and every device keeps serving the one from
// before it. Found on a device: a styling fix deployed and the phone went on
// showing the old page.
const sources = await Promise.all(
  ['src/pages/offline.astro', 'public/offline.js'].map((path) => Bun.file(path).text()),
);
const code = await Promise.all(built.outputs.map((output) => output.text()));
const stamp = precacheStamp([...sources, PRECACHE_URLS.join(',')]);
const stamped = `${code.join('')}\n// precache ${stamp}\n`;

await Bun.write('public/sw.js', stamped);
process.stdout.write(`sw.js ${stamped.length}B (precache ${stamp})\n`);
