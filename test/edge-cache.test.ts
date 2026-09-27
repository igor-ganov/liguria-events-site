// Event, venue and landmark pages are server-rendered: every crawler pass woke
// the worker and rendered them again, and TTFB (691 ms p75) is the site's one
// weak number. They are cacheable — but only the ones that belong to nobody.
import { describe, expect, test } from 'bun:test';
import { anonymousGet } from '../src/lib/http/anonymous-get.ts';
import { SESSION_COOKIE } from '../src/lib/auth/session.ts';
import { storableHtml } from '../src/lib/http/storable-html.ts';

const get = (headers: Record<string, string> = {}) =>
  new Request('https://dovego.it/event/x/', { headers });
const html = (init: ResponseInit = {}) =>
  new Response('<html></html>', { headers: { 'content-type': 'text/html' }, ...init });

describe('anonymousGet', () => {
  test('a plain GET with no session is one', () => {
    expect(anonymousGet(get())).toBe(true);
    expect(anonymousGet(get({ cookie: 'pm_lang=ru' }))).toBe(true);
  });

  // The Cache API keys on the address and ignores Vary: a signed-in request
  // must not read the shared copy either, or it gets somebody else's header.
  test('a request carrying a session is not, however harmless it looks', () => {
    expect(anonymousGet(get({ cookie: `${SESSION_COOKIE}=abc` }))).toBe(false);
    expect(anonymousGet(get({ cookie: `other=1; ${SESSION_COOKIE}=abc` }))).toBe(false);
  });

  test('and neither is anything but a GET', () => {
    expect(anonymousGet(new Request('https://dovego.it/api/favorites', { method: 'POST' }))).toBe(
      false,
    );
  });
});

describe('storableHtml', () => {
  test('a rendered page is', () => {
    expect(storableHtml(html())).toBe(true);
  });

  test('a redirect, an error and a JSON answer are not', () => {
    expect(storableHtml(html({ status: 404 }))).toBe(false);
    expect(storableHtml(new Response(undefined, { status: 302 }))).toBe(false);
    expect(storableHtml(new Response('{}', { headers: { 'content-type': 'application/json' } }))).toBe(false);
  });

  test('and neither is a page that handed out a cookie', () => {
    const headers = { 'content-type': 'text/html', 'set-cookie': `${SESSION_COOKIE}=x` };
    expect(storableHtml(new Response('<html></html>', { headers }))).toBe(false);
  });
});
