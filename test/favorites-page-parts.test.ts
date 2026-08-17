// Pure parts pulled out of the favourites page shell and the confirmation
// modal: the start-day comparator, the modal's markup and the click-to-outcome
// decision. No DOM involved.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { byStart } from '../src/components/favorites/by-start.ts';
import { confirmDialogHtml } from '../src/components/favorites/confirm-dialog-html.ts';
import { confirmOutcome } from '../src/components/favorites/confirm-outcome.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const ev = (id: string, s: string): CompactEvent => ({ id, t: id, s, c: ['other'], u: 'https://x' });

describe('byStart', () => {
  test('orders events by their ISO start day, earliest first', () => {
    const sorted = [ev('c', '2026-07-12'), ev('a', '2026-07-10'), ev('b', '2026-07-11')]
      .toSorted(byStart)
      .map((event) => event.id);
    assert.deepEqual(sorted, ['a', 'b', 'c']);
  });

  test('reports the three comparator outcomes', () => {
    assert.equal(byStart(ev('a', '2026-07-10'), ev('b', '2026-07-11')), -1);
    assert.equal(byStart(ev('a', '2026-07-11'), ev('b', '2026-07-10')), 1);
    assert.equal(byStart(ev('a', '2026-07-10'), ev('b', '2026-07-10')), 0);
  });

  test('same-day events keep the order they arrived in (a stable sort of 0s)', () => {
    const same = [ev('x', '2026-07-10'), ev('y', '2026-07-10'), ev('z', '2026-07-10')];
    assert.deepEqual(same.toSorted(byStart).map((event) => event.id), ['x', 'y', 'z']);
  });
});

describe('confirmDialogHtml', () => {
  const labels = { message: 'Remove “Opera” from the route?', cancel: 'Cancel', confirm: 'Remove' };

  test('carries the message and both action hooks the dialog listens for', () => {
    const html = confirmDialogHtml(labels);
    assert.ok(html.includes('<div class="confirm-box">'));
    assert.ok(html.includes('<p class="confirm-msg">Remove “Opera” from the route?</p>'));
    assert.ok(html.includes('<button type="button" class="chip" data-confirm-cancel>Cancel</button>'));
    assert.ok(html.includes('class="chip confirm-danger" data-confirm-ok>Remove</button>'));
  });

  test('escapes markup in every label, so an event title cannot inject HTML', () => {
    const html = confirmDialogHtml({
      message: '<img src=x onerror="alert(1)">',
      cancel: '&',
      confirm: '"',
    });
    assert.ok(!html.includes('<img'));
    assert.ok(html.includes('&#60;img src=x onerror=&#34;alert(1)&#34;&#62;'));
    assert.ok(html.includes('data-confirm-cancel>&#38;<'));
    assert.ok(html.includes('data-confirm-ok>&#34;<'));
  });
});

describe('confirmOutcome', () => {
  test('the backdrop and the cancel chip both cancel', () => {
    assert.equal(confirmOutcome(true, false, false), 'cancel');
    assert.equal(confirmOutcome(false, true, false), 'cancel');
  });

  test('the danger chip confirms', () => {
    assert.equal(confirmOutcome(false, false, true), 'confirm');
  });

  test('a click on the box itself does nothing', () => {
    assert.equal(confirmOutcome(false, false, false), 'none');
  });

  test('cancel wins, so an ambiguous click never removes a stop', () => {
    assert.equal(confirmOutcome(false, true, true), 'cancel');
    assert.equal(confirmOutcome(true, false, true), 'cancel');
  });
});
