// A weekly vertical video is the creative both YouTube and the social feeds
// need, and it is built from photographs the corpus already holds. SVG cannot
// wrap text and resvg has no metrics to ask, so the wrapping is ours.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { wrapText } from '../scripts/growth/reel/wrap-text.ts';
import { pickReelEvents } from '../scripts/growth/reel/pick-reel-events.ts';
import { slideSvg } from '../scripts/growth/reel/slide-svg.ts';
import { slideWhen } from '../scripts/growth/reel/slide-when.ts';

describe('wrapText', () => {
  test('keeps a short headline on one line', () => {
    assert.deepEqual(wrapText('Concerto di Ferragosto', 900, 64, 3), ['Concerto di Ferragosto']);
  });

  test('breaks on words, never mid-word', () => {
    const lines = wrapText('Il Museo Impossibile a Genova con oltre 60 attrazioni', 900, 64, 3);
    assert.ok(lines.length > 1);
    for (const line of lines) assert.ok(!line.startsWith(' ') && !line.endsWith(' '));
    assert.equal(lines.join(' ').replace('…', ''), 'Il Museo Impossibile a Genova con oltre 60 attrazioni'.slice(0, lines.join(' ').replace('…', '').length));
  });

  test('stops at the line budget and marks the cut', () => {
    const lines = wrapText('parola '.repeat(60), 900, 64, 3);
    assert.equal(lines.length, 3);
    assert.ok((lines.at(-1) ?? '').endsWith('…'));
  });

  test('a single word longer than the line still yields something', () => {
    const lines = wrapText('Supercalifragilisticoespiralidoso', 200, 64, 2);
    assert.ok(lines.length >= 1);
  });

  test('empty text is empty, not a line of nothing', () => {
    assert.deepEqual(wrapText('   ', 900, 64, 3), []);
  });
});

describe('slideSvg', () => {
  const slide = {
    title: 'Concerto di Ferragosto',
    when: '27 ago',
    where: 'Teatro Carlo Felice',
    photo: 'data:image/jpeg;base64,AAAA',
  };

  test('embeds the photograph rather than linking it — the renderer has no network', () => {
    assert.ok(slideSvg(slide).includes('data:image/jpeg;base64,AAAA'));
  });

  test('escapes a scraped title instead of producing broken XML', () => {
    const svg = slideSvg({ ...slide, title: 'Rock & <Roll>' });
    assert.ok(svg.includes('Rock &amp; &lt;Roll&gt;'));
    assert.ok(!svg.includes('<Roll>'));
  });

  test('is a vertical frame, which is the only shape the feeds show', () => {
    assert.ok(slideSvg(slide).includes('width="1080" height="1920"'));
  });
});

describe('pickReelEvents', () => {
  const event = (id: string, start: string, img?: string) => ({
    id,
    t: id,
    s: start,
    c: [],
    u: 'https://example.org',
    ...(img === undefined ? {} : { img }),
  });

  test('takes what is on in the window, with a picture, soonest first', () => {
    const picked = pickReelEvents(
      [
        event('c', '2026-08-30', 'x.jpg'),
        event('a', '2026-08-26', 'x.jpg'),
        event('nophoto', '2026-08-25'),
        event('b', '2026-08-27', 'x.jpg'),
      ],
      '2026-08-25',
      '2026-08-31',
      6,
    );
    assert.deepEqual(picked.map((one) => one.id), ['a', 'b', 'c']);
  });

  test('never returns more than the reel has room for', () => {
    const many = Array.from({ length: 20 }, (_, i) => event(`e${i}`, '2026-08-26', 'x.jpg'));
    assert.equal(pickReelEvents(many, '2026-08-25', '2026-08-31', 6).length, 6);
  });

  test('a week with nothing in it yields nothing, not a video of one slide', () => {
    assert.deepEqual(pickReelEvents([event('far', '2026-12-01', 'x.jpg')], '2026-08-25', '2026-08-31', 6), []);
  });
});

describe('slideWhen', () => {
  const from = '2026-08-25';
  const event = (s: string, e?: string) => ({ id: 'x', t: 'x', s, c: [], u: 'u', ...(e === undefined ? {} : { e }) });

  test('an event starting in the window shows its date', () => {
    assert.equal(slideWhen(event('2026-08-27'), from), '27 ago');
  });

  test('a run already open shows when it closes, not when it opened', () => {
    // Half the corpus is months-long: "10 apr" on a video about this week
    // reads as a stale post.
    assert.equal(slideWhen(event('2026-04-10', '2026-09-06'), from), 'fino al 6 set');
  });

  test('an open-ended run just says it is on', () => {
    assert.equal(slideWhen(event('2026-04-10'), from), 'in corso');
  });
});
