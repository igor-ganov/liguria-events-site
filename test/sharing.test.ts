// The moment the whole platform side depends on: somebody made an event and is
// about to send the link to their friends. What leaves in that message has to
// be the address of the event and nothing else.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { shareableUrl } from '../src/components/share/shareable-url.ts';
import { sendLinks } from '../src/components/share/send-links.ts';

describe('shareableUrl', () => {
  test('drops the marker the redirect added', () => {
    // Friends were being sent ".../event/abc/?created=1" — a private note to
    // ourselves, pasted into somebody else's chat.
    assert.equal(
      shareableUrl('https://dovego.it/event/abc123/?created=1'),
      'https://dovego.it/event/abc123/',
    );
  });

  test('keeps a query that carries meaning', () => {
    assert.equal(
      shareableUrl('https://dovego.it/liguria/?cats=music'),
      'https://dovego.it/liguria/?cats=music',
    );
  });

  test('keeps the rest of the query when only the marker goes', () => {
    assert.equal(
      shareableUrl('https://dovego.it/event/abc/?created=1&ref=x'),
      'https://dovego.it/event/abc/?ref=x',
    );
  });

  test('an address it cannot parse is passed through rather than lost', () => {
    assert.equal(shareableUrl('not a url'), 'not a url');
  });
});

describe('sendLinks', () => {
  const url = 'https://dovego.it/event/abc123/';
  const title = 'Concerto in cortile';

  test('WhatsApp and Telegram both carry the title and the link', () => {
    const links = sendLinks(url, title);
    assert.ok(links.whatsapp.startsWith('https://wa.me/?text='));
    assert.ok(links.whatsapp.includes(encodeURIComponent(url)));
    assert.ok(links.whatsapp.includes(encodeURIComponent(title)));
    assert.ok(links.telegram.startsWith('https://t.me/share/url?'));
    assert.ok(links.telegram.includes(encodeURIComponent(url)));
    assert.ok(links.telegram.includes(encodeURIComponent(title)));
  });

  test('an ampersand in the title cannot break out of the parameter', () => {
    const links = sendLinks(url, 'Bar & Grill');
    assert.ok(!links.whatsapp.includes('Bar & Grill'));
    assert.ok(links.whatsapp.includes('Bar%20%26%20Grill'));
  });
});
