import { expect } from '@playwright/test';
import { signSession } from '../src/lib/auth/session.ts';
import type { BrowserContext, Page } from '@playwright/test';

const SECRET = 'e2e-secret';
// A cookie belongs to a host, not to a port, so this holds on whichever port
// the local worker was moved to.
const WORKER = 'http://127.0.0.1:4410';

/** Sign a browser context in as one of the users in e2e/seed.sql: mint the
 *  session cookie the way the app does, set it, and wait for the local worker
 *  to answer before the first request is made. */
export const signInAs = async (page: Page, context: BrowserContext, userId: string): Promise<void> => {
  const token = await signSession(SECRET, userId, Date.now());
  await context.addCookies([{ name: 'dg_session', value: token, url: WORKER }]);
  await expect.poll(async () => (await page.request.get('/api/health')).status(), { timeout: 30_000 }).toBe(200);
};
