// Writing with no signal.
//
// Reading offline is a convenience; writing offline is the platform's whole
// point. Somebody standing in a courtyard with one bar of signal, typing in
// what is on tonight, must not lose it because the send failed — and must not
// be told it published when it did not.
//
// Two decisions carry all of that, and both are here as pure functions: what
// to do when a send fails, and what to do with a queued item when it is
// finally sent. Everything else is IndexedDB and a message on a screen.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { editOutcome } from '../src/lib/events/edit-outcome.ts';
import { flushVerdict } from '../src/lib/outbox/flush-verdict.ts';
import { outboxNotice } from '../src/lib/outbox/outbox-notice.ts';
import type { OutboxEntry } from '../src/lib/outbox/outbox-entry.ts';
import { sendVerdict } from '../src/lib/outbox/send-verdict.ts';

describe('sendVerdict', () => {
  test('a send that never reached the site is queued', () => {
    // fetch rejects: no signal, a captive portal, a dead tunnel. The author's
    // work is kept and goes out later.
    assert.equal(sendVerdict(undefined), 'queue');
  });

  test('the site answering is an answer, whatever it says', () => {
    assert.equal(sendVerdict(200), 'sent');
    assert.equal(sendVerdict(400), 'refused');
    assert.equal(sendVerdict(401), 'refused');
    assert.equal(sendVerdict(409), 'refused');
  });

  test('the site failing to answer properly is worth retrying', () => {
    // A 502 from in front of the worker, or a worker that fell over: the
    // submission is good and the moment is not.
    assert.equal(sendVerdict(500), 'queue');
    assert.equal(sendVerdict(502), 'queue');
    assert.equal(sendVerdict(503), 'queue');
    assert.equal(sendVerdict(429), 'queue');
  });
});

describe('flushVerdict', () => {
  test('accepted means the queue is done with it', () => {
    assert.equal(flushVerdict(200), 'done');
    assert.equal(flushVerdict(201), 'done');
  });

  test('a conflict is neither done nor retryable — it needs its author', () => {
    // The event changed while this edit sat in the queue. Sending it anyway
    // would silently overwrite whatever it was that changed.
    assert.equal(flushVerdict(409), 'conflict');
  });

  test('being refused is final, and the queue must not carry it forever', () => {
    // A malformed submission, a banned account, a deleted event: retrying
    // changes nothing and a queue that never empties stops being read.
    assert.equal(flushVerdict(400), 'refused');
    assert.equal(flushVerdict(403), 'refused');
    assert.equal(flushVerdict(404), 'refused');
  });

  test('being asked to sign in is not a refusal — the work is still good', () => {
    assert.equal(flushVerdict(401), 'keep');
  });

  test('anything that did not reach the site is kept for the next attempt', () => {
    assert.equal(flushVerdict(undefined), 'keep');
    assert.equal(flushVerdict(500), 'keep');
    assert.equal(flushVerdict(429), 'keep');
  });
});

describe('editOutcome', () => {
  test('rows changed means the edit landed', () => {
    assert.equal(editOutcome('2026-09-05T10:00:00.000Z', 1), 'saved');
    assert.equal(editOutcome(undefined, 1), 'saved');
  });

  test('nothing changed under a version guard is a conflict', () => {
    // The event moved on while this edit was waiting in a queue. Writing it
    // anyway would overwrite whatever it was that moved.
    assert.equal(editOutcome('2026-09-05T10:00:00.000Z', 0), 'conflict');
  });

  test('nothing changed without a guard is not a conflict', () => {
    // No version was claimed, so nothing was overtaken. An unchanged row means
    // the values were already what the author sent.
    assert.equal(editOutcome(undefined, 0), 'saved');
  });
});

describe('outboxNotice', () => {
  const words = {
    queued: 'Saved on this device.',
    waiting: '{count} waiting to be published',
    conflict: '“{title}” changed elsewhere while your edit was waiting.',
    sent: 'Published: “{title}”.',
  };
  const entry = (over: Partial<OutboxEntry>): OutboxEntry => ({
    id: 'a',
    url: '/api/events/submit',
    method: 'POST',
    body: '{}',
    title: 'Concerto in cortile',
    createdAt: 1,
    state: 'waiting',
    ...over,
  });

  test('an empty queue says nothing at all', () => {
    assert.equal(outboxNotice(words, []), '');
  });

  test('what is waiting is counted', () => {
    assert.equal(outboxNotice(words, [entry({}), entry({ id: 'b' })]), '2 waiting to be published');
  });

  test('a conflict is named, and outranks a count', () => {
    // A number is something to wait out; a conflict is something to act on,
    // and it needs the event's name to be acted on at all.
    const notice = outboxNotice(words, [entry({}), entry({ id: 'b', state: 'conflicted', title: 'Fiera' })]);
    assert.match(notice, /Fiera/);
    assert.doesNotMatch(notice, /waiting to be published/);
  });
});
