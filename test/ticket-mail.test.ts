// A request nobody is told about is a request nobody answers. Each time a
// thread moves, the other side gets a short letter with a link to it: the staff
// when a reader opens or adds to one, the reader when the staff answer or
// decide. The letter is built here, away from the network, so who it goes to
// and what it may contain can be held by a test.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { ticketMail } from '../src/lib/tickets/ticket-mail.ts';

const ticket = { id: 'abc123', kind: 'claim' as const, eventTitle: 'Festival <b>della</b> Scienza' };
const base = { ticket, origin: 'https://dovego.it', admins: ['a@x.test', 'b@x.test'], reader: 'reader@x.test', words: 'I run this.' };

describe('who is written to', () => {
  test('the staff, when a reader opens a request', () => {
    assert.deepEqual(ticketMail({ ...base, moved: 'opened' }).to, ['a@x.test', 'b@x.test']);
  });
  test('the staff, when a reader adds to one', () => {
    assert.deepEqual(ticketMail({ ...base, moved: 'reader-wrote' }).to, ['a@x.test', 'b@x.test']);
  });
  test('the reader, when the staff answer', () => {
    assert.deepEqual(ticketMail({ ...base, moved: 'staff-wrote' }).to, ['reader@x.test']);
  });
  test('the reader, when the staff decide', () => {
    assert.deepEqual(ticketMail({ ...base, moved: 'decided' }).to, ['reader@x.test']);
  });
});

describe('what the letter says', () => {
  const mail = ticketMail({ ...base, moved: 'opened' });

  test('names the event in the subject', () => {
    assert.match(mail.subject, /Festival <b>della<\/b> Scienza/);
  });

  test('links to the thread on this site', () => {
    assert.ok(mail.html.includes('href="https://dovego.it/tickets/abc123/"'));
  });

  test('never lets words somebody typed become markup', () => {
    const hostile = ticketMail({ ...base, moved: 'opened', words: '<img src=x onerror=alert(1)>' });
    assert.ok(!hostile.html.includes('<img'));
    assert.ok(hostile.html.includes('&lt;img'));
    assert.ok(!mail.html.includes('<b>della</b>'));
  });

  test('quotes only the beginning of a long message', () => {
    const long = ticketMail({ ...base, moved: 'opened', words: 'x'.repeat(5000) });
    assert.ok(long.html.length < 2000);
  });
});
