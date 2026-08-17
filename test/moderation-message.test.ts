import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { emailShell } from '../src/lib/moderation/email-shell.ts';
import { moderationMessage } from '../src/lib/moderation/moderation-message.ts';

describe('emailShell', () => {
  test('wraps the body with the brand and the contact line', () => {
    const html = emailShell('<p>body</p>');
    assert.ok(html.includes('Dove Go'));
    assert.ok(html.includes('<p>body</p>'));
    assert.ok(html.includes('public@dovego.it'));
  });
});

describe('moderationMessage', () => {
  test('published says the event is live', () => {
    const { subject, html } = moderationMessage('Festa', 'published', '');
    assert.equal(subject, 'Your event is live on Dove Go');
    assert.ok(html.includes('Festa'));
  });

  test('rejected links the Content Policy and states the reason', () => {
    const { subject, html } = moderationMessage('Festa', 'rejected', 'hate speech');
    assert.equal(subject, 'Your Dove Go submission wasn’t published');
    assert.ok(html.includes('https://dovego.it/content-policy'));
    assert.ok(html.includes(': hate speech.'));
  });

  test('rejected with no reason states none', () => {
    const { html } = moderationMessage('Festa', 'rejected', '');
    assert.ok(html.includes('Content Policy</a>.'));
  });

  test('any other status is the under-review notice', () => {
    assert.equal(moderationMessage('Festa', 'held', '').subject, 'Your Dove Go submission is under review');
    assert.equal(moderationMessage('Festa', 'pending', '').subject, 'Your Dove Go submission is under review');
  });

  test('the title is escaped, so a submission cannot inject markup', () => {
    const { html } = moderationMessage('<script>x</script>', 'published', '');
    assert.ok(!html.includes('<script>'));
    assert.ok(html.includes('&lt;script&gt;'));
  });

  test('the reason is escaped too', () => {
    const { html } = moderationMessage('Festa', 'rejected', '<img src=x>');
    assert.ok(!html.includes('<img'));
    assert.ok(html.includes('&lt;img'));
  });
});
