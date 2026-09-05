import { execSync } from 'node:child_process';

// Create and seed the LOCAL D1 the worker (wrangler dev --local) binds to, so
// the authenticated owner-editor flow can be tested without any real
// credentials.
//
// The BUILD is not here. Playwright starts the web servers before it runs this,
// so building here rewrote dist underneath two servers already serving it. It
// lives in the first web server's command now, and the second one waits for the
// worker bundle to appear before starting.
const run = (cmd: string): void => {
  execSync(cmd, { stdio: 'inherit' });
};

export default function globalSetup(): void {
  run('bun x wrangler d1 migrations apply dovego --local');
  run('bun x wrangler d1 execute dovego --local --file e2e/seed.sql');
}
