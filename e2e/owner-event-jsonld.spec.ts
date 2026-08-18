import { test, expect } from '@playwright/test';

// The Event rich result is checked against the REAL worker: event pages are
// server-rendered, so they exist nowhere in the static build.

test('an event page carries an Event document with everything Google asks for', async ({ page, request }) => {
  // Take a real event out of the corpus the worker itself serves from, rather
  // than assuming an id that may have been pruned.
  const corpus = await (await request.get('/data/map-events.json')).json();
  const id = corpus.at(0)?.id ?? '';
  expect(id).not.toBe('');

  await page.goto(`/event/${id}/`);
  const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
  const json = JSON.parse(raw ?? '{}');

  expect(json['@type']).toBe('Event');
  expect(json['name']).toBeTruthy();
  expect(json['startDate']).toMatch(/^\d{4}-\d{2}-\d{2}/);
  expect(json['url']).toContain('/event/');
  expect(json['eventStatus']).toBe('https://schema.org/EventScheduled');
  expect(json['eventAttendanceMode']).toBe('https://schema.org/OfflineEventAttendanceMode');
  // Location with an address is the requirement events were failing.
  expect(json['location']?.['@type']).toBe('Place');
  expect(json['location']?.['address']?.['@type']).toBe('PostalAddress');
  expect(json['location']?.['address']?.['addressCountry']).toBe('IT');
  expect(json['offers']?.['@type']).toBe('Offer');
});
