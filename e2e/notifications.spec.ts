// The daily notification, offered to anybody: the app has no sign-in, so this
// page cannot sit behind the account. Nothing here grants permission — a
// browser only does that on a real tap by a real person — so what is checked
// is that the page is reachable, says what it does, and asks before it claims
// anything.
import { expect, test } from './kit/index.ts';

test('the notification page is reachable in every language and says what it does', async ({ app }) => {
  await app.open('/notifications/');
  await expect(app.find('[data-notify]')).toBeVisible();
  await expect(app.find('[data-notify-toggle]')).toHaveAttribute('aria-pressed', 'false');
  await expect(app.find('[data-notify] p.muted')).not.toBeEmpty();

  // An hour is chosen for the reader rather than demanded of them.
  await expect(app.find('[data-notify-hour][checked], [data-notify-hour]:checked')).toHaveCount(1);
});

test('it carries the key a browser needs to subscribe', async ({ app }) => {
  // Without the public half of the VAPID key the subscribe call throws, and a
  // build that forgot to pass it would ship a switch that does nothing.
  await app.open('/notifications/');
  const key = await app.find('[data-notify]').getAttribute('data-vapid');
  expect(key?.length ?? 0).toBeGreaterThan(80);
});

// The menu entry is asserted in test/mobile-menu-parts.test.ts: the flying
// menu only exists on a phone-sized screen, and asking this project to click
// it would be testing the viewport rather than the link.
