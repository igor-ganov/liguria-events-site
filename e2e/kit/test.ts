import { appFor } from './fixtures/app.ts';
import { auditFor } from './fixtures/audit.ts';
import { netFor } from './fixtures/net.ts';
import { connectionFor } from './fixtures/connection.ts';
import { perfFor } from './fixtures/perf.ts';
import { test as base } from '@playwright/test';
import type { App } from './fixtures/app.ts';
import type { Audit } from './fixtures/audit.ts';
import type { Net } from './fixtures/net.ts';
import type { Connection } from './fixtures/connection.ts';
import type { Perf } from './fixtures/perf.ts';

/**
 * The kit's entry point. Specs import from here and nothing else, so that a
 * wait, a network assertion or an audit has exactly one implementation to fix
 * when it turns out to be flaky.
 *
 * `net` is built first and on purpose: its listeners have to be attached
 * before the first navigation, or the request that loads the page is already
 * gone by the time anybody counts.
 */
export const test = base.extend<{ net: Net; app: App; connection: Connection; audit: Audit; perf: Perf }>({
  net: async ({ page }, use) => {
    await use(netFor(page));
  },
  app: async ({ page, net }, use) => {
    await use(appFor(page, net));
  },
  connection: async ({ page, context }, use) => {
    await use(connectionFor(page, context));
  },
  audit: async ({ page }, use) => {
    await use(auditFor(page));
  },
  perf: async ({ page }, use) => {
    await use(perfFor(page));
  },
});
