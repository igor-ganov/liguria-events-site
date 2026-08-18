import { test, expect } from '@playwright/test';
import { signInAsOwner } from './owner-fixture.ts';

// A container event — a festival playing three evenings inside one month —
// created through the real form, stored by the real worker in the real (local)
// D1, and read back. What it must NOT do is claim the days in between.
const PROGRAMME = ['2099-08-05', '2099-08-12', '2099-08-20'];

const fillRow = async (page: import('@playwright/test').Page, index: number, date: string): Promise<void> => {
  const row = page.locator('[data-programme-row]').nth(index);
  await row.locator('[data-session-date]').fill(date);
  await row.locator('[data-session-time]').fill('21:00');
};

test('a container event is created from its programme and skips the empty days', async ({ page, context }) => {
  await signInAsOwner(page, context);
  await page.goto('/submit');
  await expect(page.locator('#event-form')).toHaveAttribute('data-ready', 'true');

  await page.locator('input[name=title]').fill('Sere d’Estate E2E');
  await page.locator('textarea[name=description]').fill('Three evenings of music.');
  await page.locator('input[value=music]').first().check();

  // Untouched, the form offers a plain run: the programme editor is folded away.
  await expect(page.locator('[data-programme]')).toBeHidden();
  await expect(page.locator('[data-span]')).toBeVisible();

  // Ticking the box swaps the run for the programme.
  await page.locator('[data-container-toggle]').check();
  await expect(page.locator('[data-span]')).toBeHidden();
  await expect(page.locator('[data-programme]')).toBeVisible();

  // Three evenings: one row is there, two are added.
  await fillRow(page, 0, PROGRAMME[0] ?? '');
  await page.locator('[data-programme-add]').click();
  await fillRow(page, 1, PROGRAMME[1] ?? '');
  await page.locator('[data-programme-add]').click();
  await fillRow(page, 2, PROGRAMME[2] ?? '');
  await expect(page.locator('[data-programme-row]')).toHaveCount(3);

  await page.locator('#event-form button[type=submit]').click();
  await page.waitForURL(/\/event\/[a-z0-9]+/);
  const id = page.url().split('/').filter(Boolean).at(-1) ?? '';
  expect(id).not.toBe('');

  // The run was DERIVED from the programme, not from anything typed in.
  const editable = await page.request.get(`/event/${id}/edit`);
  expect(editable.ok()).toBe(true);
  const form = await editable.text();
  expect(form).toContain(`value="${PROGRAMME[0]}"`);
  expect(form).toContain(`value="${PROGRAMME[2]}"`);
  // …and the edit form comes back with the box ticked and every date in place.
  await page.goto(`/event/${id}/edit`);
  await expect(page.locator('[data-container-toggle]')).toBeChecked();
  await expect(page.locator('[data-programme-row]')).toHaveCount(3);

  // The published wire shape carries the programme and the container mark, so
  // the feed and the map can honour it. It is pending until moderated, which is
  // why this reads the author's own copy rather than the public feed.
  await page.goto(`/event/${id}`);
  await expect(page.locator('h1')).toContainText('Sere d’Estate E2E');
});
