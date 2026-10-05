// Proof that a claimant speaks for an event: a code sent to an address the
// staff took from the organiser's own page, typed back by whoever claims it.
// The code is derived from a secret rather than stored, so nothing readable
// about it rests in the database; what is kept is where it went, how many were
// sent and how many guesses were spent.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { claimAddress } from '../src/lib/tickets/claim-address.ts';
import { claimCode } from '../src/lib/tickets/claim-code.ts';
import { claimCodeMail } from '../src/lib/tickets/claim-code-mail.ts';
import { codeVerdict } from '../src/lib/tickets/code-verdict.ts';
import { maySendCode } from '../src/lib/tickets/may-send-code.ts';

const NOW = '2026-10-05T12:00:00.000Z';
const row = { address: 'info@teatro.example', sends: 1, tries: 0, sentBy: 'admin', expiresAt: '2026-10-08T12:00:00.000Z' };

describe('the code', () => {
  test('is six digits', async () => {
    assert.match(await claimCode('secret', 'ticket-1', 'info@teatro.example', 1), /^\d{6}$/);
  });
  test('is the same when asked for again', async () => {
    assert.equal(await claimCode('secret', 't', 'a@b.example', 1), await claimCode('secret', 't', 'a@b.example', 1));
  });
  test('changes with the thread, the address, the sending and the secret', async () => {
    const codes = await Promise.all([
      claimCode('secret', 't', 'a@b.example', 1),
      claimCode('secret', 'u', 'a@b.example', 1),
      claimCode('secret', 't', 'c@b.example', 1),
      claimCode('secret', 't', 'a@b.example', 2),
      claimCode('other', 't', 'a@b.example', 1),
    ]);
    assert.equal(new Set(codes).size, codes.length);
  });
});

describe('an address', () => {
  test('is kept trimmed and in lower case', () => {
    assert.equal(claimAddress('  Info@Teatro.Example '), 'info@teatro.example');
  });
  test('is refused when it is not one', () => {
    assert.deepEqual(['', 'teatro', 'a@b', 'a b@c.example', 'a@b.example,c@d.example', undefined].map(claimAddress), ['', '', '', '', '', '']);
  });
});

describe('what a typed code is worth', () => {
  test('nothing, when none was sent', () => {
    assert.equal(codeVerdict(undefined, '123456', '123456', NOW), 'none');
  });
  test('right, when it is the one sent', () => {
    assert.equal(codeVerdict(row, ' 123456 ', '123456', NOW), 'right');
  });
  test('wrong, when it is another', () => {
    assert.equal(codeVerdict(row, '654321', '123456', NOW), 'wrong');
  });
  test('spent after five wrong guesses, even when right', () => {
    assert.equal(codeVerdict({ ...row, tries: 5 }, '123456', '123456', NOW), 'spent');
  });
  test('spent once it has run out, even when right', () => {
    assert.equal(codeVerdict({ ...row, expiresAt: '2026-10-05T11:59:59.000Z' }, '123456', '123456', NOW), 'spent');
  });
});

describe('when a code may be sent', () => {
  const claim = { kind: 'claim' as const, status: 'open' as const };
  test('for a claim that is still open', () => {
    assert.equal(maySendCode(claim, undefined), true);
    assert.equal(maySendCode({ ...claim, status: 'answered' }, row), true);
  });
  test('never for a report', () => {
    assert.equal(maySendCode({ ...claim, kind: 'report' }, undefined), false);
  });
  test('never for a closed thread', () => {
    assert.deepEqual([maySendCode({ ...claim, status: 'resolved' }, undefined), maySendCode({ ...claim, status: 'rejected' }, undefined)], [false, false]);
  });
  test('three times at most', () => {
    assert.deepEqual([maySendCode(claim, { ...row, sends: 2 }), maySendCode(claim, { ...row, sends: 3 })], [true, false]);
  });
});

describe('the letter', () => {
  const mail = claimCodeMail({ address: 'info@teatro.example', code: '123456', eventTitle: 'Notte <i>bianca</i>', eventUrl: 'https://dovego.it/event/abc/' });
  test('goes to the address and nowhere else', () => {
    assert.deepEqual(mail.to, ['info@teatro.example']);
  });
  test('carries the code and the event, with nothing typed left as markup', () => {
    assert.ok(mail.html.includes('123456'));
    assert.ok(mail.html.includes('Notte &lt;i&gt;bianca&lt;/i&gt;'));
    assert.ok(mail.html.includes('https://dovego.it/event/abc/'));
  });
  test('says what to do when the request is not theirs', () => {
    assert.ok(mail.html.includes('ignore'));
    assert.ok(mail.html.includes('ignorate'));
  });
});

describe('who may type a code in', () => {
  const member = { id: 'u1', email: 'u1@x.test', handle: 'u1', role: 'member' as const, banned: false };
  test('the reader who made the claim', async () => {
    const { mayEnterCode } = await import('../src/lib/tickets/may-enter-code.ts');
    assert.equal(mayEnterCode(member, { userId: 'u1' }), true);
  });
  test('nobody else: not another reader, not the staff, not a visitor', async () => {
    const { mayEnterCode } = await import('../src/lib/tickets/may-enter-code.ts');
    assert.deepEqual([mayEnterCode(member, { userId: 'u2' }), mayEnterCode({ ...member, id: 'a', role: 'admin' as const }, { userId: 'u1' }), mayEnterCode(undefined, { userId: 'u1' })], [false, false, false]);
  });
});
