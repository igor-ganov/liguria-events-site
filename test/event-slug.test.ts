// What an event's address says. `/event/154d29e7bff5/` tells a reader nothing,
// and tells a search engine nothing either: the words people type — the name of
// the thing, where it is, when it is — were the one part of an event the URL
// left out.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { eventIdOfPath } from '../src/lib/events/event-id-of-path.ts';
import { eventSlug } from '../src/lib/events/event-slug.ts';

const concerto = {
  id: '51a5e3abbc8f',
  t: 'Concerto in cortile a lume di candela',
  s: '2026-12-05',
  v: 'Palazzo Spinola',
};

describe('eventSlug', () => {
  test('reads as the event: what, where, when', () => {
    assert.equal(
      eventSlug(concerto),
      'concerto-in-cortile-a-lume-di-candela-palazzo-spinola-2026-12-05-51a5e3abbc8f',
    );
  });

  test('an event with no venue simply leaves that part out', () => {
    assert.equal(eventSlug({ ...concerto, v: undefined }), 'concerto-in-cortile-a-lume-di-candela-2026-12-05-51a5e3abbc8f');
  });

  test('accents and punctuation survive as ascii', () => {
    const slug = eventSlug({ ...concerto, t: 'Perchè "l’Università"?', v: 'Caffè' });
    assert.equal(slug, 'perche-l-universita-caffe-2026-12-05-51a5e3abbc8f');
  });

  test('a long title is cut, and never leaves a dangling hyphen', () => {
    const slug = eventSlug({ ...concerto, t: 'The Impossible Museum in Genova with over 60 attractions and optical illusions' });
    assert.ok(slug.length < 120, String(slug.length));
    assert.ok(!/--/.test(slug), slug);
    assert.ok(slug.endsWith('-2026-12-05-51a5e3abbc8f'), slug);
  });

  test('a title made only of punctuation still yields an address', () => {
    assert.equal(eventSlug({ ...concerto, t: '!!!', v: undefined }), 'x-2026-12-05-51a5e3abbc8f');
  });
});

describe('eventIdOfPath', () => {
  test('finds the event in a full slug, and in a bare id', () => {
    assert.equal(eventIdOfPath(eventSlug(concerto)), '51a5e3abbc8f');
    assert.equal(eventIdOfPath('51a5e3abbc8f'), '51a5e3abbc8f');
  });

  test('takes the last id, not one that happens to be in the words', () => {
    // Twelve hex characters are a plausible thing to write in a title.
    assert.equal(eventIdOfPath('deadbeef1234-fiera-2026-12-05-51a5e3abbc8f'), '51a5e3abbc8f');
  });

  test('anything that never named an event here yields nothing', () => {
    assert.equal(eventIdOfPath('zzz'), '');
    assert.equal(eventIdOfPath(''), '');
    assert.equal(eventIdOfPath('concerto-in-cortile'), '');
    // Thirteen characters is not one of ours.
    assert.equal(eventIdOfPath('51a5e3abbc8fa'), '');
  });
});
