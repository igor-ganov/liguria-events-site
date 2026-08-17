import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { parseVerdict } from '../src/lib/moderation/parse-verdict.ts';

describe('parseVerdict', () => {
  test('reads a clean verdict', () => {
    assert.deepEqual(parseVerdict('{"verdict":"allow","reason":"fine","gem":false}'), {
      verdict: 'allow',
      reason: 'fine',
      gem: false,
    });
  });

  test('finds the JSON block inside chatter around it', () => {
    const v = parseVerdict('Sure! {"verdict":"reject","reason":"hate speech","gem":false} Hope that helps.');
    assert.equal(v.verdict, 'reject');
    assert.equal(v.reason, 'hate speech');
  });

  test('text with no JSON object holds the event', () => {
    assert.deepEqual(parseVerdict('I cannot answer that.'), {
      verdict: 'hold',
      reason: 'could not classify',
      gem: false,
    });
  });

  test('unparsable JSON holds the event', () => {
    assert.equal(parseVerdict('{not json at all}').verdict, 'hold');
  });

  test('an unrecognised verdict holds rather than publishing', () => {
    assert.equal(parseVerdict('{"verdict":"maybe"}').verdict, 'hold');
    assert.equal(parseVerdict('{"verdict":true}').verdict, 'hold');
    assert.equal(parseVerdict('{}').verdict, 'hold');
  });

  test('a missing or non-string reason reads as empty', () => {
    assert.equal(parseVerdict('{"verdict":"allow"}').reason, '');
    assert.equal(parseVerdict('{"verdict":"allow","reason":7}').reason, '');
  });

  test('a long reason is cut to 300 characters', () => {
    const long = 'x'.repeat(400);
    assert.equal(parseVerdict(`{"verdict":"allow","reason":"${long}"}`).reason.length, 300);
  });

  test('gem is only true for a literal true', () => {
    assert.equal(parseVerdict('{"verdict":"allow","gem":true}').gem, true);
    assert.equal(parseVerdict('{"verdict":"allow","gem":"true"}').gem, false);
    assert.equal(parseVerdict('{"verdict":"allow"}').gem, false);
  });
});
