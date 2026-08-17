import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { sqlText } from '../src/lib/sql-text.ts';

describe('sqlText', () => {
  test('keeps a filled field', () => {
    assert.equal(sqlText('Teatro Carlo Felice'), 'Teatro Carlo Felice');
  });

  test("an empty field becomes the database's empty marker", () => {
    assert.equal(sqlText(''), JSON.parse('null'));
  });

  test('a custom rule decides what survives', () => {
    const isHttpUrl = (value: string) => /^https?:\/\//.test(value);
    assert.equal(sqlText('https://dovego.it', isHttpUrl), 'https://dovego.it');
    assert.equal(sqlText('javascript:alert(1)', isHttpUrl), JSON.parse('null'));
  });

  test('a rejected field is stored as no value, not as its raw text', () => {
    assert.equal(sqlText('../../etc/passwd', (v) => v.startsWith('/uploads/')), JSON.parse('null'));
  });
});
