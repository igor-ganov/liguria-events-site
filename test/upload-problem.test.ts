import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { uploadProblem } from '../src/lib/img/upload-problem.ts';

const file = (type: string, bytes = 10): File =>
  new File([new Uint8Array(bytes)], 'cover', { type });

describe('uploadProblem', () => {
  test('an acceptable image has nothing to object to', () => {
    assert.equal(uploadProblem(file('image/png')), undefined);
    assert.equal(uploadProblem(file('image/jpeg')), undefined);
  });

  test('a field that is not a file at all', () => {
    assert.equal(uploadProblem(undefined), 'No file.');
    assert.equal(uploadProblem('cover.png'), 'No file.');
    assert.equal(uploadProblem({ name: 'cover.png' }), 'No file.');
  });

  test('an unsupported type', () => {
    assert.equal(uploadProblem(file('image/tiff')), 'Use a JP, PNG, WebP, AVIF or GIF image.');
  });

  test('an image over 8 MB', () => {
    assert.equal(uploadProblem(file('image/png', 8 * 1024 * 1024 + 1)), 'Image must be under 8 MB.');
  });

  test('exactly 8 MB still passes', () => {
    assert.equal(uploadProblem(file('image/png', 8 * 1024 * 1024)), undefined);
  });

  // The endpoint has always reported the type before the size, and a caller
  // fixing one problem at a time depends on that order.
  test('the type is reported before the size', () => {
    const tooBigAndWrong = file('image/tiff', 8 * 1024 * 1024 + 1);
    assert.equal(uploadProblem(tooBigAndWrong), 'Use a JP, PNG, WebP, AVIF or GIF image.');
  });
});
