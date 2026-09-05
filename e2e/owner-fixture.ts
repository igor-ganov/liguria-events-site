import { expect } from '@playwright/test';
import { signSession } from '../src/lib/auth/session.ts';
import type { BrowserContext, Page } from '@playwright/test';

// Shared owner sign-in for the worker-backed 'owner' project: mint the session
// cookie (as the app does), set it, and — crucially — wait for the local worker
// to actually accept connections before the first request. Several owner specs
// start in parallel right as `wrangler dev` boots; without this gate they race
// it and fail with ECONNREFUSED.
import { OWNER } from './owner-id.ts';

const SECRET = 'e2e-secret';

export const signInAsOwner = async (
  page: Page,
  context: BrowserContext,
): Promise<string> => {
  const token = await signSession(SECRET, OWNER, Date.now());
  await context.addCookies([{ name: 'dg_session', value: token, url: 'http://127.0.0.1:4410' }]);
  await expect.poll(async () => (await page.request.get('/api/health')).status(), { timeout: 30_000 }).toBe(200);
  return token;
};
