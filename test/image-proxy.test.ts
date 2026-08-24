// The proxy exists so a link preview shows a 1200x630 picture served from our
// own origin instead of a hot-linked thumbnail in whatever shape the source
// happened to use. It must not become a free bandwidth relay (R2.2).
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { encodeImageSource } from '../src/lib/img/encode-image-source.ts';
import { decodeImageSource } from '../src/lib/img/decode-image-source.ts';
import { allowedImageSource } from '../src/lib/img/allowed-image-source.ts';
import { socialImageUrl } from '../src/lib/img/social-image-url.ts';

const SITE = new URL('https://dovego.it');

describe('image source encoding', () => {
  test('survives a round trip, including a query string and non-ASCII', () => {
    const src = 'https://s1.ticketm.net/dam/a/1b2/città-è-3.jpg?rand=1833441318&x=1';
    assert.equal(decodeImageSource(encodeImageSource(src)), src);
  });

  test('produces a path-safe token — no slash, plus or padding', () => {
    const token = encodeImageSource('https://www.mentelocale.it/repository/77682_half.jpg');
    assert.match(token, /^[A-Za-z0-9_-]+$/);
  });

  test('refuses to decode a token that is not one of ours', () => {
    assert.equal(decodeImageSource('!!!not-base64!!!'), undefined);
  });
});

describe('allowedImageSource', () => {
  test('accepts the hosts the corpus actually carries', () => {
    assert.ok(allowedImageSource('https://s1.ticketm.net/dam/a/1b2/3.jpg'));
    assert.ok(allowedImageSource('https://www.mentelocale.it/repository/1.jpg'));
    assert.ok(allowedImageSource('https://palazzoducale.genova.it/x.jpg'));
  });

  test('rejects anything else before a fetch can happen', () => {
    assert.equal(allowedImageSource('https://example.com/1.jpg'), false);
    // A look-alike host must not pass on a suffix match.
    assert.equal(allowedImageSource('https://evil-s1.ticketm.net.attacker.io/1.jpg'), false);
  });

  test('rejects a non-http scheme outright', () => {
    assert.equal(allowedImageSource('file:///etc/passwd'), false);
    assert.equal(allowedImageSource('http://192.168.0.1/x.jpg'), false);
  });

  test('is not fooled by a malformed URL', () => {
    assert.equal(allowedImageSource('not a url'), false);
  });
});

describe('socialImageUrl', () => {
  test('sends a remote image through the proxy, cropped to the preview size', () => {
    const url = socialImageUrl('https://s1.ticketm.net/dam/a/1b2/3.jpg', SITE);
    assert.ok(url?.startsWith('https://dovego.it/cdn-cgi/image/'));
    assert.ok(url?.includes('width=1200,height=630,fit=cover'));
    assert.ok(url?.includes('format=jpeg'));
    assert.ok(url?.includes('/img/'));
  });

  test('an image already on our origin skips the proxy', () => {
    const url = socialImageUrl('/uploads/ab/cd.jpg', SITE);
    assert.equal(
      url,
      'https://dovego.it/cdn-cgi/image/width=1200,height=630,fit=cover,quality=82,format=jpeg/uploads/ab/cd.jpg',
    );
  });

  test('an image from a host we do not proxy falls back to the branded default', () => {
    assert.equal(socialImageUrl('https://example.com/1.jpg', SITE), 'https://dovego.it/og-default.jpg');
  });

  test('no image at all still yields the branded default', () => {
    assert.equal(socialImageUrl(undefined, SITE), 'https://dovego.it/og-default.jpg');
  });
});
