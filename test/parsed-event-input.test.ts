import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { parsedEventInput } from '../src/lib/events/parsed-event-input.ts';

const valid = { title: 'Festa del Mare', startDate: '2026-08-20', description: 'Boats.' };

describe('parsedEventInput', () => {
  test('valid input is a one-element array of the normalized value', () => {
    const { accepted } = parsedEventInput(valid);
    assert.equal(accepted.length, 1);
    assert.equal(accepted[0]?.title, 'Festa del Mare');
    assert.equal(accepted[0]?.startDate, '2026-08-20');
  });

  test('invalid input accepts nothing at all', () => {
    assert.deepEqual(parsedEventInput({ title: 'x' }).accepted, []);
    assert.deepEqual(parsedEventInput({}).accepted, []);
  });

  test('the rejection is the endpoints original 400 with the parser detail', async () => {
    const { rejection } = parsedEventInput({ title: 'x' });
    const res = rejection();
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), {
      error: 'invalid',
      detail: 'Title and a valid start date are required.',
    });
  });

  test('a malformed end date is reported with its own detail', async () => {
    const res = parsedEventInput({ ...valid, endDate: '20-08-2026' }).rejection();
    assert.deepEqual(await res.json(), { error: 'invalid', detail: 'End date is malformed.' });
  });

  test('valid input still builds a rejection, carrying no detail', async () => {
    const res = parsedEventInput(valid).rejection();
    assert.deepEqual(await res.json(), { error: 'invalid', detail: '' });
  });
});
