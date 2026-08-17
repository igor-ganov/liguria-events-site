import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { gatedResponse } from '../src/lib/gated-response.ts';

const rejected = () => new Response('no', { status: 403 });

describe('gatedResponse', () => {
  test('runs the handler for a present value', async () => {
    const res = await gatedResponse('a')(rejected)((value) => new Response(value));
    assert.equal(await res.text(), 'a');
  });

  test('rejects an absent value with the caller-supplied response', async () => {
    const res = await gatedResponse(undefined)(rejected)(() => new Response('ran'));
    assert.equal(res.status, 403);
  });

  test('never invokes the handler for an absent value', async () => {
    const calls: string[] = [];
    await gatedResponse<string>(undefined)(rejected)((value) => {
      calls.push(value);
      return new Response();
    });
    assert.deepEqual(calls, []);
  });

  test('a failing predicate rejects even though the value is present', async () => {
    const res = await gatedResponse('a', (v) => v === 'b')(rejected)(() => new Response('ran'));
    assert.equal(res.status, 403);
  });

  test('never invokes the handler when the predicate fails', async () => {
    let ran = false;
    await gatedResponse('a', () => false)(rejected)(() => {
      ran = true;
      return new Response();
    });
    assert.equal(ran, false);
  });

  test('awaits an async handler', async () => {
    const res = await gatedResponse(7)(rejected)(async (n) => new Response(String(n * 2)));
    assert.equal(await res.text(), '14');
  });

  test('gates nest, so the outer rejection wins', async () => {
    const res = await gatedResponse<string>(undefined)(() => new Response('outer', { status: 401 }))(
      (value) => gatedResponse(value)(() => new Response('inner', { status: 403 }))(() => new Response('ok')),
    );
    assert.equal(await res.text(), 'outer');
  });
});
