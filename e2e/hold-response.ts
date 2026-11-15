import type { Page } from '@playwright/test';

/**
 * Hold every response matching `glob` until the returned release is called:
 * a load is exactly as slow as the spec needs it to be, and no slower — there
 * is no delay to pick, only a moment to let go.
 */
export const holdResponse = async (page: Page, glob: string): Promise<() => void> => {
  const gate: { open: () => void } = { open: () => undefined };
  const opened = new Promise<void>((resolve) => {
    gate.open = resolve;
  });
  await page.route(glob, async (route) => {
    await opened;
    await route.continue().catch(() => undefined);
  });
  return () => gate.open();
};
