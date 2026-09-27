// The ask for closed-test testers.
//
// It exists to solve a counting problem — Google wants twelve people opted in
// for fourteen days — so the thing worth testing is that both steps are
// reachable and that the ask does not follow readers around the site. A banner
// repeated on every city and venue page is the kind that gets a site ignored.
import { expect, test } from '@playwright/test';
import { TESTER_CALL } from '../src/lib/testing/tester-call.ts';

test('a region page asks for testers, with both steps linked', async ({ page }) => {
  await page.goto('/liguria/');
  const call = page.getByRole('complementary', { name: /Help launch the app/i });
  await expect(call).toBeVisible();
  await expect(call.getByRole('link', { name: 'Join the testers' })).toHaveAttribute(
    'href',
    TESTER_CALL.group,
  );
  await expect(call.getByRole('link', { name: 'Then install it' })).toHaveAttribute(
    'href',
    TESTER_CALL.optIn,
  );
});

test('it does not follow the reader into a city', async ({ page }) => {
  await page.goto('/liguria/genova/');
  await expect(page.getByRole('complementary', { name: /Help launch the app/i })).toHaveCount(0);
});

test('every language has the words, not an empty strip', async ({ page }) => {
  // The dictionary is declared in four places and a key missing from any one of
  // them renders blank rather than failing — which is how a banner ships saying
  // nothing at all.
  await page.goto('/it/liguria/');
  await expect(page.getByRole('link', { name: 'Unisciti ai tester' })).toBeVisible();
  await page.goto('/ru/liguria/');
  await expect(page.getByRole('link', { name: 'Стать тестером' })).toBeVisible();
});
