import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { magicLinkLanding } from '../src/lib/auth/magic-link-landing.ts';

// The landing gate is what stops a one-shot token being spent on the wrong
// request. It is exercised with a deliberately explosive env: reaching the real
// sign-in would throw, so an empty result also proves there was no side effect.
// Completing a sign-in needs D1 + KV and is covered by e2e.
const boom = new Proxy(
  {},
  {
    get: () => {
      throw new Error('the landing must not touch the bindings for this request');
    },
  },
);
const env = Object(boom);

const landing = (path: string, query: string) =>
  magicLinkLanding(env, new URL(`https://dovego.it${path}${query}`), Date.now());

describe('magicLinkLanding', () => {
  test('ignores every path that is not the magic-link landing', async () => {
    assert.deepEqual(await landing('/', '?t=abc'), []);
    assert.deepEqual(await landing('/liguria/', '?t=abc'), []);
    assert.deepEqual(await landing('/auth/verify/extra', '?t=abc'), []);
    assert.deepEqual(await landing('/auth/verifyx', '?t=abc'), []);
  });

  test('ignores the landing itself when there is no token', async () => {
    assert.deepEqual(await landing('/auth/verify', ''), []);
    assert.deepEqual(await landing('/auth/verify', '?t='), []);
    assert.deepEqual(await landing('/auth/verify', '?other=1'), []);
  });

  test('does nothing without runtime bindings, however valid the link looks', async () => {
    const url = new URL('https://dovego.it/auth/verify?t=abc');
    assert.deepEqual(await magicLinkLanding(undefined, url, Date.now()), []);
  });
});
