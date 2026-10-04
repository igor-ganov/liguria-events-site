// The daily notification, offered to anybody: the app has no sign-in, so this
// page cannot sit behind the account. Nothing here grants permission — a
// browser only does that on a real tap by a real person — so what is checked
// is that the page is reachable, says what it does, and carries everything the
// subscribe call needs.
//
// Run against the real worker rather than the static build: the page is
// rendered per request because the fallback place is the region the request
// came from, and only a worker knows that.
import { test, expect } from '@playwright/test';

const PAGES = ['/notifications/', '/it/notifications/'];

test('the notification page is reachable in every language and says what it does', async ({ page }) => {
  for (const path of PAGES) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('[data-notify]')).toBeVisible();
    await expect(page.locator('[data-notify-toggle]')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('[data-notify] p.muted')).not.toBeEmpty();

    // An hour is chosen for the reader rather than demanded of them.
    await expect(page.locator('[data-notify-hour]:checked')).toHaveCount(1);
  }
});

test('it carries the key a browser needs to subscribe', async ({ page }) => {
  // Without the public half of the VAPID key the subscribe call throws, and a
  // build that forgot to pass it would ship a switch that does nothing.
  await page.goto('/notifications/');
  const key = await page.locator('[data-notify]').getAttribute('data-vapid');
  expect(key?.length ?? 0).toBeGreaterThan(80);
});

test('and a place the sender understands, for the reader who declines the prompt', async ({ page }) => {
  // The common case is a declined location prompt. Until now the card carried
  // no place at all, the subscription was sent an empty one, and the sender
  // answers an unrecognised place with the whole country: somebody who asked
  // about their own area was woken about Palermo.
  for (const path of PAGES) {
    await page.goto(path);
    const place = await page.locator('[data-notify]').getAttribute('data-place');
    expect(place ?? '').toMatch(/^region:[a-z-]+$/);
  }
});

// The menu entry is asserted in test/mobile-menu-parts.test.ts: the flying
// menu only exists on a phone-sized screen, and asking this project to click
// it would be testing the viewport rather than the link.
