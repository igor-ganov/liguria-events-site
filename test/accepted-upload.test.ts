import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { acceptedUpload } from '../src/lib/img/accepted-upload.ts';
import { uploadProblem } from '../src/lib/img/upload-problem.ts';

const file = (type: string, bytes = 10): File =>
  new File([new Uint8Array(bytes)], 'cover', { type });

describe('acceptedUpload', () => {
  test('an acceptable image is a one-element array carrying its extension', () => {
    const accepted = acceptedUpload(file('image/webp'));
    assert.equal(accepted.length, 1);
    assert.equal(accepted[0]?.ext, 'webp');
    assert.equal(accepted[0]?.file.type, 'image/webp');
  });

  test('nothing is accepted when there is no file', () => {
    assert.deepEqual(acceptedUpload(undefined), []);
    assert.deepEqual(acceptedUpload('cover.png'), []);
  });

  test('nothing is accepted for an unsupported type or an oversized image', () => {
    assert.deepEqual(acceptedUpload(file('image/tiff')), []);
    assert.deepEqual(acceptedUpload(file('image/png', 8 * 1024 * 1024 + 1)), []);
  });

  // The two must never disagree: acceptance is defined as "no problem found".
  test('acceptance and the reported problem are exact opposites', () => {
    const candidates: readonly unknown[] = [
      undefined,
      'cover.png',
      file('image/png'),
      file('image/tiff'),
      file('image/gif', 8 * 1024 * 1024 + 1),
    ];
    for (const candidate of candidates) {
      assert.equal(
        acceptedUpload(candidate).length === 1,
        uploadProblem(candidate) === undefined,
        `disagreement for ${String(candidate)}`,
      );
    }
  });
});
