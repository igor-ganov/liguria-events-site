import { test, expect } from '@playwright/test';

// A favourited landmark/place (its data captured in dovego:fav-pois) renders on
// the favourites page beside events, and counts as a favourite so the route
// tools appear — even with an empty events corpus.
test('a favourited landmark shows on the favourites page', async ({ page }) => {
  await page.route('**/events.json*', (route) =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify({ events: [] }) }),
  );

  await page.goto('/favorites/');
  await page.evaluate(() => {
    localStorage.setItem('dovego:favorites', JSON.stringify(['wd:Q1']));
    localStorage.setItem(
      'dovego:fav-pois',
      JSON.stringify({
        'wd:Q1': { id: 'wd:Q1', kind: 'landmark', region: 'liguria', name: 'Test Castle', lat: 44.4, lng: 8.9, cat: 'castle', url: '/landmark/liguria/test--x/' },
      }),
    );
  });
  await page.goto('/favorites/');

  await expect(page.getByText('Test Castle')).toBeVisible();
  await expect(page.locator('[data-route-generate]')).toBeVisible(); // it's a favourite → tools show
});
