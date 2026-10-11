// The map under an event is somebody else's application: half a megabyte of
// script from another origin. The browser's own lazy loading fetches a frame
// long before it is on screen — a short event page had it competing with the
// title for the connection — so the frame is given its address only when the
// reader has actually reached it.
import { expect, test } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

type Wire = Readonly<{ id: string; v?: string; a?: string }>;

const EVENTS_URL = process.env['EVENTS_URL'] ?? 'https://liguria-events-bot.igor-ganov.workers.dev/events.json';

const placed = async (request: APIRequestContext): Promise<Wire> => {
  const body: Readonly<{ events: readonly Wire[] }> = await (await request.get(EVENTS_URL)).json();
  const found = body.events.find((event) => event.v !== undefined && event.a !== undefined);
  expect(found).toBeDefined();
  return found ?? { id: '' };
};

test('the map of an event is fetched when the reader reaches it, not before', async ({ page, request }) => {
  const event = await placed(request);
  const asked: string[] = [];
  page.on('request', (sent) => asked.push(new URL(sent.url()).hostname));
  await page.setViewportSize({ width: 390, height: 500 });
  await page.goto(`/event/${event.id}/`);
  const frame = page.locator('.event-map iframe');
  await expect(frame).toHaveCount(1);
  expect(asked.filter((host) => host.includes('google'))).toEqual([]);
  await expect(frame).not.toHaveAttribute('src', /.+/);
  await frame.scrollIntoViewIfNeeded();
  await expect(frame).toHaveAttribute('src', /maps\.google\.com/);
});
