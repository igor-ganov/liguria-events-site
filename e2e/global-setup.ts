import { execSync } from 'node:child_process';

// Prepare the worker-backed E2E project ('owner'): build the site, then create
// and seed the LOCAL D1 the local worker (wrangler dev --local) binds to, so the
// authenticated owner-editor flow can be tested without any real credentials.
const run = (cmd: string): void => execSync(cmd, { stdio: 'inherit' });

export default function globalSetup(): void {
  run('bun run build');
  run('bun x wrangler d1 migrations apply dovego --local');
  run('bun x wrangler d1 execute dovego --local --file e2e/seed.sql');
}
