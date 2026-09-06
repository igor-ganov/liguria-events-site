// The offline page's script, bundled to a fixed path so the service worker can
// precache it by name. Everything else the page needs is inline, because a
// fallback page that depends on a file it might not have is not a fallback.
//
// It exists so the page can offer what IS readable: the launch URL redirects
// and is never cached itself, and an offline page that says "nothing here"
// while holding the feed somebody just read is worse than none.
import { rm } from 'node:fs/promises';

await rm('public/offline.js', { force: true });

const built = await Bun.build({
  entrypoints: ['src/offline/list-cached.ts'],
  outdir: 'public',
  naming: 'offline.js',
  target: 'browser',
  format: 'esm',
  minify: true,
});

built.logs.filter((log) => log.level === 'error').forEach((log) => process.stderr.write(`${log}\n`));
process.exitCode = [built.success].filter((ok) => !ok).length;
process.stdout.write(`offline.js ${(await Bun.file('public/offline.js').arrayBuffer()).byteLength}B\n`);
