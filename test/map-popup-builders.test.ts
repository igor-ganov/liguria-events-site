import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { eventPopupHtml } from '../src/lib/map/event-popup-html.ts';
import { clusterRowHtml } from '../src/lib/map/cluster-row-html.ts';
import { clusterPopupHtml } from '../src/lib/map/cluster-popup-html.ts';
import { popupPhoto } from '../src/lib/map/popup-photo.ts';
import { popupDesc } from '../src/lib/map/popup-desc.ts';
import { richPopupHtml } from '../src/lib/map/rich-popup-html.ts';
import { landmarkPopupHtml } from '../src/lib/map/landmark-popup-html.ts';
import { placeFactsHtml } from '../src/lib/map/place-facts-html.ts';
import { placePopupHtml } from '../src/lib/map/place-popup-html.ts';

const HOSTILE = '"><img src=x onerror=alert(1)>& done';
const ESCAPED = '&quot;>&lt;img src=x onerror=alert(1)>&amp; done';

describe('eventPopupHtml', () => {
  const popup = { href: '/en/event/abc/', image: 'https://img/a.jpg', title: 'Festa', when: '10 Aug' };

  test('renders the link, thumbnail, title and date', () => {
    const html = eventPopupHtml(popup);
    assert.equal(
      html,
      '<a class="map-pop" href="/en/event/abc/"><span class="map-pop-thumb">' +
        '<img src="https://img/a.jpg" alt="" loading="lazy" referrerpolicy="no-referrer" /></span>' +
        '<span class="map-pop-title">Festa</span><span class="map-pop-when">10 Aug</span></a>',
    );
  });

  test('leaves the thumbnail span empty when the event has no image', () => {
    const html = eventPopupHtml({ ...popup, image: undefined });
    assert.ok(html.includes('<span class="map-pop-thumb"></span>'));
    assert.ok(!html.includes('<img'));
  });

  test('escapes a hostile title and date', () => {
    const html = eventPopupHtml({ ...popup, title: HOSTILE, when: HOSTILE });
    assert.ok(html.includes(`<span class="map-pop-title">${ESCAPED}</span>`));
    assert.ok(html.includes(`<span class="map-pop-when">${ESCAPED}</span>`));
  });

  test('escapes an image URL carrying a quote', () => {
    const html = eventPopupHtml({ ...popup, image: 'https://img/a.jpg?q="x"&y=1' });
    assert.ok(html.includes('src="https://img/a.jpg?q=&quot;x&quot;&amp;y=1"'));
  });
});

describe('clusterRowHtml', () => {
  const row = { href: '/en/event/abc/', image: 'https://img/a.jpg', title: 'Festa', when: '10 Aug' };

  test('renders one row with its thumbnail, title and date', () => {
    assert.equal(
      clusterRowHtml(row),
      '<a class="map-clus-row" href="/en/event/abc/"><span class="map-clus-thumb">' +
        '<img src="https://img/a.jpg" alt="" loading="lazy" referrerpolicy="no-referrer" /></span>' +
        '<span class="map-clus-text"><span class="map-clus-title">Festa</span>' +
        '<span class="map-pop-when">10 Aug</span></span></a>',
    );
  });

  test('renders an empty thumbnail span without an image', () => {
    assert.ok(clusterRowHtml({ ...row, image: undefined }).includes('<span class="map-clus-thumb"></span>'));
  });

  test('escapes a hostile title', () => {
    assert.ok(clusterRowHtml({ ...row, title: HOSTILE }).includes(`<span class="map-clus-title">${ESCAPED}</span>`));
  });
});

describe('clusterPopupHtml', () => {
  const row = { href: '/e/1', image: undefined, title: 'One', when: 'Mon' };

  test('heads the list with the row count and renders every row', () => {
    const html = clusterPopupHtml([row, { ...row, href: '/e/2', title: 'Two' }]);
    assert.ok(html.startsWith('<div class="map-clus-card"><div class="map-clus-head">2</div><div class="map-clus-list">'));
    assert.ok(html.endsWith('</div></div>'));
    assert.equal(html.split('map-clus-row').length - 1, 2);
    assert.ok(html.includes('>One<') && html.includes('>Two<'));
  });

  test('an empty cluster renders a zero head and no rows', () => {
    assert.equal(
      clusterPopupHtml([]),
      '<div class="map-clus-card"><div class="map-clus-head">0</div><div class="map-clus-list"></div></div>',
    );
  });
});

describe('popupPhoto', () => {
  test('wraps an eager no-referrer image in the thumb span', () => {
    assert.equal(
      popupPhoto('https://img/a.jpg'),
      '<span class="map-pop-thumb"><img src="https://img/a.jpg" alt="" referrerpolicy="no-referrer" /></span>',
    );
  });

  test('renders nothing for an absent or empty image', () => {
    assert.equal(popupPhoto(undefined), '');
    assert.equal(popupPhoto(''), '');
  });

  test('escapes a hostile image URL', () => {
    assert.ok(popupPhoto(HOSTILE).includes(`src="${ESCAPED}"`));
  });
});

describe('popupDesc', () => {
  test('renders the blurb in a paragraph', () => {
    assert.equal(popupDesc('A short blurb.'), '<p class="map-pop-desc">A short blurb.</p>');
  });

  test('renders nothing for an absent or empty description', () => {
    assert.equal(popupDesc(undefined), '');
    assert.equal(popupDesc(''), '');
  });

  test('clips a long blurb at a whole word', () => {
    const html = popupDesc(`${'word '.repeat(60)}tail`);
    assert.ok(html.endsWith('…</p>'));
    assert.ok(html.length < 180);
    assert.ok(!html.includes('tail'));
  });

  test('escapes a hostile description', () => {
    assert.equal(popupDesc(HOSTILE), `<p class="map-pop-desc">${ESCAPED}</p>`);
  });
});

const RICH = {
  href: '/en/landmark/liguria/x/',
  image: undefined,
  kindColor: '#abc',
  kindIcon: '<svg id="kind" />',
  kindLabel: 'Church',
  title: 'San Lorenzo',
  desc: undefined,
  facts: '',
  sources: [],
};

describe('richPopupHtml', () => {
  test('renders the bare card when there is no image, blurb, facts or source', () => {
    assert.equal(
      richPopupHtml(RICH),
      '<div class="map-pop map-pop--rich"><a class="map-pop-main" href="/en/landmark/liguria/x/">' +
        '<span class="map-pop-body"><span class="lm-pop-kind" style="--lm:#abc"><svg id="kind" /> Church</span>' +
        '<span class="map-pop-title">San Lorenzo</span></span></a></div>',
    );
  });

  test('places photo, blurb, facts and chips in that order', () => {
    const html = richPopupHtml({
      ...RICH,
      image: 'https://img/a.jpg',
      desc: 'A cathedral.',
      facts: '<div class="map-pop-facts">x</div>',
      sources: [{ name: 'Wikipedia', url: 'https://w/a?b=1&c=2' }],
    });
    const at = (needle: string): number => html.indexOf(needle);
    assert.ok(at('map-pop-thumb') < at('map-pop-title'));
    assert.ok(at('map-pop-title') < at('map-pop-desc'));
    assert.ok(at('map-pop-desc') < at('map-pop-facts'));
    assert.ok(at('map-pop-facts') < at('map-pop-src'));
    assert.ok(html.includes('href="https://w/a?b=1&amp;c=2"'));
  });

  test('escapes the href, kind label and title', () => {
    const html = richPopupHtml({ ...RICH, href: HOSTILE, kindLabel: HOSTILE, title: HOSTILE });
    assert.ok(html.includes(`href="${ESCAPED}"`));
    assert.equal(html.split(ESCAPED).length - 1, 3);
  });
});

describe('landmarkPopupHtml', () => {
  test('is the rich card with no facts block', () => {
    const { facts, ...landmark } = RICH;
    assert.equal(facts, '');
    assert.equal(landmarkPopupHtml(landmark), richPopupHtml(RICH));
    assert.ok(!landmarkPopupHtml(landmark).includes('map-pop-facts'));
  });

  test('carries its photo, blurb and sources through', () => {
    const html = landmarkPopupHtml({
      ...RICH,
      image: 'https://img/l.jpg',
      desc: 'Romanesque cathedral.',
      sources: [{ name: 'Wikidata', url: 'https://wd/Q1' }],
    });
    assert.ok(html.includes('src="https://img/l.jpg"'));
    assert.ok(html.includes('<p class="map-pop-desc">Romanesque cathedral.</p>'));
    assert.ok(html.includes('>Wikidata</a>'));
  });
});

const FACTS = {
  hours: 'Mo-Fr 09:00-18:00',
  hoursLabel: 'Opening hours',
  hoursIcon: '<svg id="clock" />',
  phone: '+39 010 123',
  phoneLabel: 'Phone',
  phoneIcon: '<svg id="phone" />',
};

describe('placeFactsHtml', () => {
  test('renders hours then phone inside the facts row', () => {
    assert.equal(
      placeFactsHtml(FACTS),
      '<div class="map-pop-facts">' +
        '<span class="map-pop-fact map-pop-hours" title="Opening hours"><svg id="clock" />' +
        '<span>Mo-Fr 09:00-18:00</span></span>' +
        '<span class="map-pop-fact" title="Phone"><svg id="phone" />+39 010 123</span></div>',
    );
  });

  test('renders only the fact the place carries', () => {
    const hoursOnly = placeFactsHtml({ ...FACTS, phone: undefined });
    assert.ok(hoursOnly.includes('map-pop-hours'));
    assert.ok(!hoursOnly.includes('id="phone"'));
    const phoneOnly = placeFactsHtml({ ...FACTS, hours: '' });
    assert.ok(!phoneOnly.includes('map-pop-hours'));
    assert.ok(phoneOnly.includes('id="phone"'));
  });

  test('renders nothing when the place has neither fact', () => {
    assert.equal(placeFactsHtml({ ...FACTS, hours: undefined, phone: undefined }), '');
    assert.equal(placeFactsHtml({ ...FACTS, hours: '', phone: '' }), '');
  });

  test('clips a long opening-hours string at a whole word', () => {
    const html = placeFactsHtml({ ...FACTS, hours: `${'Mo-Su 09:00-18:00; '.repeat(6)}end` });
    assert.ok(html.includes('…</span>'));
    assert.ok(!html.includes('end</span>'));
  });

  test('escapes hostile hours, phone and labels', () => {
    const html = placeFactsHtml({ ...FACTS, hours: HOSTILE, phone: HOSTILE, hoursLabel: HOSTILE, phoneLabel: HOSTILE });
    assert.ok(html.includes(`title="${ESCAPED}"`));
    // The payload's tag and attribute break are neutralised everywhere.
    assert.ok(!html.includes('<img src=x'));
    assert.ok(!html.includes('"><img'));
  });
});

describe('placePopupHtml', () => {
  const popup = { ...RICH, href: '/en/place/liguria/x/', facts: FACTS };

  test('renders the facts row between the blurb and the source chips', () => {
    const html = placePopupHtml({ ...popup, desc: 'A bar.', sources: [{ name: 'Website', url: 'https://b/' }] });
    assert.ok(html.indexOf('map-pop-desc') < html.indexOf('map-pop-facts'));
    assert.ok(html.indexOf('map-pop-facts') < html.indexOf('map-pop-src'));
    assert.ok(html.includes('<span>Mo-Fr 09:00-18:00</span>'));
  });

  test('omits the facts row when the place carries no hours or phone', () => {
    const html = placePopupHtml({ ...popup, facts: { ...FACTS, hours: undefined, phone: undefined } });
    assert.ok(!html.includes('map-pop-facts'));
    assert.equal(html, richPopupHtml({ ...RICH, href: '/en/place/liguria/x/' }));
  });

  test('renders the category icon card when the place has no photo or sources', () => {
    const html = placePopupHtml({ ...popup, facts: { ...FACTS, hours: undefined, phone: undefined } });
    assert.ok(!html.includes('<img'));
    assert.ok(!html.includes('map-pop-src'));
    assert.ok(html.includes('<svg id="kind" /> Church'));
  });
});
