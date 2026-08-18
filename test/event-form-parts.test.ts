// Pure decisions pulled out of the event form's client shell: the mode read off
// the form, the JSON body, where a submit goes and where it lands.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { eventFormMode } from '../src/components/events/event-form-mode.ts';
import { eventFormValues } from '../src/components/events/event-form-values.ts';
import { eventSubmitTarget } from '../src/components/events/event-submit-target.ts';
import { eventRedirectPath } from '../src/components/events/event-redirect-path.ts';
import { uploadedImageUrl } from '../src/components/events/uploaded-image-url.ts';
import { jsonField } from '../src/lib/json-field.ts';

describe('eventFormMode', () => {
  test('an explicit edit mode edits', () => {
    assert.equal(eventFormMode('edit'), 'edit');
  });
  test('anything else creates', () => {
    assert.equal(eventFormMode('create'), 'create');
    assert.equal(eventFormMode(''), 'create');
    assert.equal(eventFormMode(undefined), 'create');
    assert.equal(eventFormMode('EDIT'), 'create');
  });
  test('a prototype key is not a mode', () => {
    assert.equal(eventFormMode('constructor'), 'create');
  });
});

describe('eventFormValues', () => {
  const filled = (): FormData => {
    const data = new FormData();
    data.set('title', 'Concerto');
    data.set('startDate', '2026-07-04');
    data.set('lat', '44.41');
    data.append('category', 'music');
    data.append('category', 'art');
    data.set('free', 'on');
    return data;
  };

  test('reads the text fields, the categories and the free flag', () => {
    const values = eventFormValues(filled());
    assert.equal(values['title'], 'Concerto');
    assert.equal(values['startDate'], '2026-07-04');
    assert.equal(values['lat'], '44.41');
    assert.deepEqual(values['categories'], ['music', 'art']);
    assert.equal(values['free'], true);
  });

  test('a missing field is sent as an empty string, so an edit can clear it', () => {
    const values = eventFormValues(new FormData());
    assert.equal(values['title'], '');
    assert.equal(values['endDate'], '');
    assert.equal(values['website'], '');
    assert.deepEqual(values['categories'], []);
  });

  test('the kind and the programme travel with the form', () => {
    const data = filled();
    data.set('container', 'on');
    const values = eventFormValues(data, [{ date: '2026-08-05', time: '21:00', title: '' }]);
    assert.equal(values['kind'], 'container');
    assert.deepEqual(values['sessions'], [{ date: '2026-08-05', time: '21:00', title: '' }]);
  });

  test('an unticked box sends a standalone event with no programme', () => {
    const values = eventFormValues(filled());
    assert.equal(values['kind'], 'standalone');
    assert.deepEqual(values['sessions'], []);
  });

  test('the free flag is on only for the checkbox value', () => {
    const data = new FormData();
    data.set('free', 'off');
    assert.equal(eventFormValues(data)['free'], false);
    assert.equal(eventFormValues(new FormData())['free'], false);
  });

  test('carries every field the endpoints expect', () => {
    assert.deepEqual(Object.keys(eventFormValues(new FormData())), [
      'title',
      'description',
      'startDate',
      'endDate',
      'venue',
      'address',
      'phone',
      'website',
      'coverImage',
      'lat',
      'lng',
      'categories',
      'free',
      'kind',
      'sessions',
    ]);
  });
});

describe('eventSubmitTarget', () => {
  test('an edit patches the event itself', () => {
    assert.deepEqual(eventSubmitTarget('edit', 'ev1'), {
      url: '/api/events/ev1',
      method: 'PATCH',
      pending: 'Saving…',
    });
  });
  test('a creation posts to the submit endpoint and ignores the id', () => {
    assert.deepEqual(eventSubmitTarget('create', 'ev1'), {
      url: '/api/events/submit',
      method: 'POST',
      pending: 'Submitting…',
    });
  });
});

describe('eventRedirectPath', () => {
  test('an edit returns to the same event', () => {
    assert.equal(eventRedirectPath('edit', 'ev1', 'ignored'), '/event/ev1');
  });
  test('a creation goes to the id the endpoint answered with', () => {
    assert.equal(eventRedirectPath('create', '', 'new1'), '/event/new1');
  });
  test('an answer with no id still leaves the form', () => {
    assert.equal(eventRedirectPath('create', '', ''), '/event/');
  });
});

describe('jsonField', () => {
  test('reads a string field', () => {
    assert.equal(jsonField({ id: 'ev1' }, 'id'), 'ev1');
    assert.equal(jsonField({ id: '' }, 'id'), '');
  });
  test('a field of another shape reads as nothing', () => {
    assert.equal(jsonField({ id: 42 }, 'id'), undefined);
    assert.equal(jsonField({ id: { nested: 'x' } }, 'id'), undefined);
  });
  test('a missing field, or no object at all, reads as nothing', () => {
    assert.equal(jsonField({}, 'id'), undefined);
    assert.equal(jsonField(undefined, 'id'), undefined);
    assert.equal(jsonField('a string', 'id'), undefined);
    assert.equal(jsonField([], 'id'), undefined);
  });
  test('an inherited member is not a field', () => {
    assert.equal(jsonField({}, 'constructor'), undefined);
    assert.equal(jsonField({}, 'toString'), undefined);
  });
});

describe('uploadedImageUrl', () => {
  test('an accepted upload yields its URL', () => {
    assert.equal(uploadedImageUrl(true, '/uploads/a.jpg'), '/uploads/a.jpg');
  });
  test('a rejected response yields nothing, URL or not', () => {
    assert.equal(uploadedImageUrl(false, '/uploads/a.jpg'), undefined);
    assert.equal(uploadedImageUrl(false, undefined), undefined);
  });
  test('an accepted response with no usable URL yields nothing', () => {
    assert.equal(uploadedImageUrl(true, undefined), undefined);
    assert.equal(uploadedImageUrl(true, ''), undefined);
  });
});
