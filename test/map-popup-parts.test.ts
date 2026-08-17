import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { escapeAttr } from '../src/lib/map/escape-attr.ts';
import { clipText } from '../src/lib/map/clip-text.ts';
import { readView } from '../src/lib/map/read-view.ts';
import { sourceChips } from '../src/lib/map/source-chips.ts';
import { popupThumb } from '../src/lib/map/popup-thumb.ts';
import { eventMarkerHtml } from '../src/lib/map/event-marker-html.ts';

describe('escapeAttr', () => {
  test('escapes the characters that break out of an attribute', () => {
    assert.equal(escapeAttr('a & b'), 'a &amp; b');
    assert.equal(escapeAttr('<script>'), '&lt;script>');
    assert.equal(escapeAttr('say "hi"'), 'say &quot;hi&quot;');
    assert.equal(escapeAttr('& < "'), '&amp; &lt; &quot;');
  });
  test('leaves ordinary text untouched', () => {
    assert.equal(escapeAttr('Festa di San Lorenzo'), 'Festa di San Lorenzo');
  });
});

describe('clipText', () => {
  test('returns a short string unchanged', () => {
    assert.equal(clipText(20)('short'), 'short');
  });
  test('cuts at a whole word and marks the cut', () => {
    assert.equal(clipText(12)('alpha beta gamma'), 'alpha beta…');
  });
  test('a string exactly at the limit is not clipped', () => {
    assert.equal(clipText(5)('12345'), '12345');
  });
});

describe('readView', () => {
  test('reads zoom and centre from the query', () => {
    assert.deepEqual(readView(new URLSearchParams('z=11.4&c=44.4123,8.9312')), {
      zoom: 11.4,
      lat: 44.4123,
      lng: 8.9312,
    });
  });
  test('is undefined without z, with a bad centre, or when empty', () => {
    assert.equal(readView(new URLSearchParams('c=44.4,8.9')), undefined);
    assert.equal(readView(new URLSearchParams('z=11&c=nope')), undefined);
    assert.equal(readView(new URLSearchParams('')), undefined);
  });
});

describe('sourceChips', () => {
  test('renders one escaped link per source', () => {
    const html = sourceChips([{ name: 'Mente "Locale"', url: 'https://x/?a=1&b=2' }]);
    assert.ok(html.includes('class="map-pop-src"'));
    assert.ok(html.includes('href="https://x/?a=1&amp;b=2"'));
    assert.ok(html.includes('Mente &quot;Locale&quot;'));
  });
  test('renders nothing when there are no sources', () => {
    assert.equal(sourceChips([]), '');
  });
});

describe('eventMarkerHtml', () => {
  const render = eventMarkerHtml('<svg id="icon" />');
  test('shows the photo when the event has one', () => {
    const html = render('https://img/a.jpg?a=1&b=2');
    assert.ok(html.includes('src="https://img/a.jpg?a=1&amp;b=2"'));
    assert.ok(!html.includes('ev-marker-face--icon'));
  });
  test('falls back to the category icon when there is no photo', () => {
    assert.equal(render(undefined), '<div class="ev-marker-face ev-marker-face--icon"><svg id="icon" /></div>');
  });
  test('treats an empty image string as no photo', () => {
    assert.ok(render('').includes('ev-marker-face--icon'));
  });
});

describe('popupThumb', () => {
  test('renders a lazy no-referrer image when there is one', () => {
    const html = popupThumb('https://img/a.jpg');
    assert.ok(html.includes('src="https://img/a.jpg"'));
    assert.ok(html.includes('loading="lazy"'));
    assert.ok(html.includes('referrerpolicy="no-referrer"'));
  });
  test('renders nothing when the image is absent', () => {
    assert.equal(popupThumb(undefined), '');
  });
});
