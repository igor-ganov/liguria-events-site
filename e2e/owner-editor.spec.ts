import { test, expect } from '@playwright/test';
import corpus from './fixtures/corpus.json' with { type: 'json' };
import { signInAsOwner } from './owner-fixture.ts';

// The AUTHENTICATED owner-route editor, against the real worker (wrangler dev
// --local) with a seeded test user, signed in with a minted cookie.
const POI = { id: 'wd:Q1', kind: 'landmark', region: 'liguria', name: 'Test Castle', lat: 44.41, lng: 8.94, cat: 'castle', url: '/landmark/liguria/test--x/' };

test('owner adds a favourite POI, reorders, and the save persists to D1', async ({ page, context }) => {
  await signInAsOwner(page, context);
  await page.route('**/events.json*', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify(corpus) }));

  // Create a route OWNED by the test user (e1 + e2 on their shared day). page.request
  // shares the context cookie and baseURL (so it authenticates as the owner).
  const day = corpus.events[0].s;
  const data = JSON.stringify({ mode: 'walking', dayIds: [{ day, ids: ['e1', 'e2'] }], durations: {} });
  const created = await page.request.post('/api/routes', { data: { name: 'Owner E2E', data } });
  const body = await created.json();
  const id = body.id;

  // A favourited POI (landmark) is available for the "add from favourites" picker.
  await page.addInitScript((poi) => {
    localStorage.setItem('dovego:favorites', JSON.stringify([poi.id]));
    localStorage.setItem('dovego:fav-pois', JSON.stringify({ [poi.id]: poi }));
  }, POI);

  await page.goto(`/route/${id}`);

  // SSR renders the OWNER editor (not the read-only view) for the signed-in owner.
  await expect(page.locator('[data-route-root]')).toHaveAttribute('data-owned', '1');
  await expect(page.locator('[data-route-save-edits]')).toBeVisible();
  await expect(page.locator('.route-stop')).toHaveCount(2);

  // Add the favourited landmark via the picker → becomes a 3rd stop, its own link.
  await page.locator('[data-op="add"]').first().selectOption({ label: POI.name });
  await expect(page.locator('.route-stop')).toHaveCount(3);
  const poiLink = page.locator(`.route-stop a[href="${POI.url}"]`);
  await expect(poiLink).toBeVisible();

  // Reorder (move the first stop down), then save.
  await page.locator('[data-op="down"]:not([disabled])').first().click();
  await page.locator('[data-route-save-edits]').click();
  await expect(page.locator('[data-route-edit-status]')).toHaveText(/saved/i);

  // Reload from D1 — the added POI and the edit survived (real PATCH persistence).
  await page.reload();
  await expect(page.locator('.route-stop')).toHaveCount(3);
  await expect(page.locator(`.route-stop a[href="${POI.url}"]`)).toBeVisible();
});
