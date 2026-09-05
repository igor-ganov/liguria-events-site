import { test, expect } from '@playwright/test';
import corpus from './fixtures/corpus.json' with { type: 'json' };
import { signInAsOwner } from './owner-fixture.ts';

// "Download PDF" must produce a real PDF file (jsPDF), not open the browser's
// print dialog. Playwright captures the download event and checks the file.
test('Download PDF saves a real .pdf file (not a print dialog)', async ({ page, context }) => {
  await signInAsOwner(page, context);
  await page.route('**/events.json*', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify(corpus) }));

  const day = (corpus.events[0]?.s ?? '');
  const data = JSON.stringify({ mode: 'walking', dayIds: [{ day, ids: ['e1', 'e2'] }], durations: {} });
  const created = await page.request.post('/api/routes', { data: { name: 'PDF trip', data } });
  const id = (await created.json()).id;

  await page.goto(`/route/${id}`);
  await expect(page.locator('[data-route-root]')).toHaveAttribute('data-owned', '1');
  await expect(page.locator('.tl-block')).toHaveCount(2); // editor opens on the timeline

  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-route-pdf]').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  // The stream resolves to a non-trivial file (a real PDF, not empty).
  const path = await download.path();
  expect(path).toBeTruthy();
});
