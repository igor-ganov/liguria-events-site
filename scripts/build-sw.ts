// The service worker is bundled, not hand-written into public/, so its routing
// table is the same module the unit tests run against. A worker whose rules
// were retyped by hand would drift from the tests that claim to cover them.
//
// Output is a single file with no imports, so it registers as a classic
// worker — module workers are still not supported everywhere.
import { rm } from 'node:fs/promises';

await rm('public/sw.js', { force: true });

const built = await Bun.build({
  entrypoints: ['src/sw/service-worker.ts'],
  outdir: 'public',
  naming: 'sw.js',
  target: 'browser',
  format: 'esm',
  minify: true,
});

const failed = built.logs.filter((log) => log.level === 'error').map(String);
failed.forEach((message) => process.stderr.write(`${message}\n`));
process.exitCode = [built.success].filter((ok) => !ok).length;
process.stdout.write(`sw.js ${(await Bun.file('public/sw.js').arrayBuffer()).byteLength}B\n`);
