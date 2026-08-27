// Counting in three languages. Every city and venue page on the site said
// "1 eventi in programma", and Russian needs three forms where Italian needs
// two. What is tested here is which form gets picked; the words themselves
// live in the dictionaries, which is where translations belong.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { pluralForm } from '../src/lib/i18n/plural-form.ts';
import { countText } from '../src/lib/i18n/count-text.ts';

const MARKED = {
  one: 'ONE {n} in {place}',
  few: 'FEW {n} in {place}',
  many: 'MANY {n} in {place}',
  other: 'OTHER {n} in {place}',
} as const;

const TWO_FORMS = {
  one: '{n} evento in programma a {place}',
  other: '{n} eventi in programma a {place}',
} as const;

describe('pluralForm', () => {
  test('English and Italian split at one', () => {
    assert.equal(pluralForm('en', 1), 'one');
    assert.equal(pluralForm('en', 2), 'other');
    assert.equal(pluralForm('it', 1), 'one');
    assert.equal(pluralForm('it', 0), 'other');
  });

  test('Russian counts in three', () => {
    assert.equal(pluralForm('ru', 1), 'one');
    assert.equal(pluralForm('ru', 3), 'few');
    assert.equal(pluralForm('ru', 7), 'many');
    // …and starts over at twenty-one, which is the whole reason for asking the
    // platform's own rules rather than writing `n === 1`.
    assert.equal(pluralForm('ru', 21), 'one');
    assert.equal(pluralForm('ru', 22), 'few');
    assert.equal(pluralForm('ru', 11), 'many');
  });
});

describe('countText', () => {
  test('one event is singular', () => {
    assert.equal(countText('it', TWO_FORMS, 1, 'Genova'), '1 evento in programma a Genova');
  });

  test('more than one is not', () => {
    assert.equal(countText('it', TWO_FORMS, 4, 'Genova'), '4 eventi in programma a Genova');
  });

  test('a language with three forms gets all three', () => {
    assert.equal(countText('ru', MARKED, 1, 'Genova'), 'ONE 1 in Genova');
    assert.equal(countText('ru', MARKED, 3, 'Genova'), 'FEW 3 in Genova');
    assert.equal(countText('ru', MARKED, 8, 'Genova'), 'MANY 8 in Genova');
  });

  test('a missing form falls back to the general one rather than to nothing', () => {
    assert.equal(countText('ru', TWO_FORMS, 8, 'Genova'), '8 eventi in programma a Genova');
  });
});
