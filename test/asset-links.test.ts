// Digital Asset Links is the handshake that makes the Android app an app and
// not a browser in a costume: without it the wrapper opens dovego.it inside a
// Custom Tab with a URL bar across the top, and every screenshot of the store
// listing has that bar in it.
//
// It fails silently and it fails on the SITE's side, which is why the file is
// generated from the same module the app id lives in rather than pasted.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { ANDROID_APP } from '../src/lib/pwa/android-app.ts';
import { assetLinks } from '../src/lib/pwa/asset-links.ts';

describe('assetLinks', () => {
  test('grants the one relation a Trusted Web Activity needs', () => {
    const [entry] = assetLinks();
    assert.deepEqual(entry?.relation, ['delegate_permission/common.handle_all_urls']);
    assert.equal(entry?.target.namespace, 'android_app');
    assert.equal(entry?.target.package_name, ANDROID_APP.packageName);
  });

  test('carries every certificate that may sign a build people install', () => {
    const [entry] = assetLinks();
    // More than one is normal and correct: the key that signs a build here, and
    // the key Google re-signs with once the app goes through Play App Signing.
    // A missing fingerprint costs a release, so this asserts the shape of each.
    assert.ok((entry?.target.sha256_cert_fingerprints.length ?? 0) >= 1);
    entry?.target.sha256_cert_fingerprints.forEach((fingerprint) => {
      assert.match(fingerprint, /^(?:[0-9A-F]{2}:){31}[0-9A-F]{2}$/, fingerprint);
    });
  });

  test('the package name is a reverse domain under our own', () => {
    assert.equal(ANDROID_APP.packageName, 'it.dovego.twa');
  });
});
