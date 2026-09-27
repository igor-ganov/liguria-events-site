// The ask for closed-test testers.
//
// It exists to solve a counting problem — Google wants twelve people opted in
// for fourteen days — so what is worth guarding is that both steps are
// reachable, that the ask does not follow readers around the site, and that it
// obeys its own switch.
//
// The switch is read here rather than skipping the spec when it is off: a test
// that opts out on a flag is a test that stops guarding the flag, and this one
// is meant to be flipped twice.
import { expect, test } from '@playwright/test';
import { TESTER_CALL } from '../src/lib/testing/tester-call.ts';

const SHOWN = Number(TESTER_CALL.open);

test('a region page carries the call exactly when it is switched on', async ({ page }) => {
  await page.goto('/liguria/');
  await expect(page.getByRole('complementary', { name: /Help launch the app/i })).toHaveCount(SHOWN);
});

test('both steps are linked, at the addresses the constant names', async ({ page }) => {
  // Two links because joining and opting in are two separate things; somebody
  // who only does the first gets no app and no explanation why.
  await page.goto('/liguria/');
  await expect(page.locator(`a[href="${TESTER_CALL.group}"]`)).toHaveCount(SHOWN);
  await expect(page.locator(`a[href="${TESTER_CALL.optIn}"]`)).toHaveCount(SHOWN);
});

test('it does not follow the reader into a city', async ({ page }) => {
  await page.goto('/liguria/genova/');
  await expect(page.getByRole('complementary', { name: /Help launch the app/i })).toHaveCount(0);
  await expect(page.locator(`a[href="${TESTER_CALL.group}"]`)).toHaveCount(0);
});

test('the other languages say it in their own words', async ({ page }) => {
  // The dictionary is declared in four places and a key missing from any one
  // of them renders blank rather than failing, so a live strip could ship
  // saying nothing at all.
  await page.goto('/it/liguria/');
  await expect(page.getByRole('link', { name: 'Unisciti ai tester' })).toHaveCount(SHOWN);
  await page.goto('/ru/liguria/');
  await expect(page.getByRole('link', { name: 'Стать тестером' })).toHaveCount(SHOWN);
});
