// A cluster plaque shows a number. Whoever asks for it by voice says that
// number, so the name the plaque answers to has to carry it — the map library
// names every marker "Map marker" unless told otherwise.
import { expect, test } from '@playwright/test';

test('a cluster answers to the number written on it', async ({ page }) => {
  await page.goto('/liguria/map/');
  const cluster = page.locator('.ev-cluster').first();
  await expect(cluster).toBeVisible({ timeout: 30_000 });
  const shown = (await cluster.innerText()).trim();
  expect(await cluster.getAttribute('aria-label')).toContain(shown);
});
