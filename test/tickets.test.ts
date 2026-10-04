// Requests from readers: "something is wrong with this event" and "this event
// is mine". Each is a thread between one reader and us, which makes three
// rules matter more than anything on the page: what may be opened, who may
// read a thread, and what a new message does to its state.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { mayReadTicket } from '../src/lib/tickets/may-read-ticket.ts';
import { statusAfter } from '../src/lib/tickets/status-after.ts';
import { ticketDenial } from '../src/lib/tickets/ticket-denial.ts';
import { ticketInput } from '../src/lib/tickets/ticket-input.ts';
import { actionsFor } from '../src/lib/tickets/actions-for.ts';
import type { AppUser } from '../src/lib/auth/types.ts';

const form = (fields: Readonly<Record<string, string>>): FormData => {
  const data = new FormData();
  Object.entries(fields).forEach(([key, value]) => data.set(key, value));
  return data;
};
const good = { kind: 'report', event: '0123456789ab', title: 'Concerto', body: 'The date is wrong.' };

describe('opening a request', () => {
  test('a report with something to say is accepted', () => {
    assert.equal(ticketDenial(ticketInput(form(good))), undefined);
  });

  test('a claim is accepted too', () => {
    assert.equal(ticketDenial(ticketInput(form({ ...good, kind: 'claim' }))), undefined);
  });

  test('anything else is refused, and says why', async () => {
    const cases: readonly (readonly [Readonly<Record<string, string>>, string])[] = [
      [{ ...good, kind: 'complaint' }, 'kind'],
      [{ ...good, event: 'nope' }, 'event'],
      [{ ...good, body: '   ' }, 'body'],
    ];
    const answers = await Promise.all(
      cases.map(async ([fields]) => (await ticketDenial(ticketInput(form(fields)))?.json()) as { error: string }),
    );
    assert.deepEqual(answers.map((answer) => answer.error), cases.map(([, reason]) => `invalid ${reason}`));
  });

  test('the words are trimmed and capped, so one request cannot be a megabyte', () => {
    const input = ticketInput(form({ ...good, body: `  ${'x'.repeat(9000)}  `, title: 'T'.repeat(500) }));
    assert.equal(input.body.length, 4000);
    assert.equal(input.title.length, 200);
  });
});

const member = (id: string): AppUser => ({ id, email: `${id}@test.local`, handle: id, role: 'member', banned: false });
const admin: AppUser = { ...member('boss'), role: 'admin' };

describe('who may read a thread', () => {
  const ticket = { userId: 'ann' };
  test('the reader who opened it', () => assert.equal(mayReadTicket(member('ann'), ticket), true));
  test('an admin', () => assert.equal(mayReadTicket(admin, ticket), true));
  test('nobody else, signed in or not', () => {
    assert.equal(mayReadTicket(member('bob'), ticket), false);
    assert.equal(mayReadTicket(undefined, ticket), false);
  });
});

describe('what a message does to a thread', () => {
  test('ours makes it answered', () => assert.equal(statusAfter('open', true), 'answered'));
  test('the reader writing back opens it again', () => {
    assert.equal(statusAfter('answered', false), 'open');
    assert.equal(statusAfter('resolved', false), 'open');
    assert.equal(statusAfter('rejected', false), 'open');
  });
  test('ours on a closed thread leaves it closed', () => {
    assert.equal(statusAfter('resolved', true), 'resolved');
    assert.equal(statusAfter('rejected', true), 'rejected');
  });
});

describe('what an admin may do with a thread', () => {
  test('a claim can be approved, a report cannot', () => {
    assert.deepEqual(actionsFor({ kind: 'claim', status: 'open' }), ['approve', 'resolve', 'reject']);
    assert.deepEqual(actionsFor({ kind: 'report', status: 'open' }), ['resolve', 'reject']);
  });
  test('a closed thread offers nothing', () => {
    assert.deepEqual(actionsFor({ kind: 'claim', status: 'resolved' }), []);
    assert.deepEqual(actionsFor({ kind: 'report', status: 'rejected' }), []);
  });
});
