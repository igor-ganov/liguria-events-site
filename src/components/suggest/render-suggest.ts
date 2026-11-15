import { html, nothing } from 'lit';
import { branch } from '../../lib/branch.ts';
import { flatOptions } from './flat-options.ts';
import { openSuggestion } from './open-suggestion.ts';
import { SUGGEST_IDS } from './suggest-ids.ts';
import type { TemplateResult } from 'lit';
import type { SuggestDoc, SuggestKind } from '../../lib/suggest/suggest-doc.ts';
import type { SuggestHost } from './suggest-host.ts';

// A press on the list must not take focus from the input: the combobox keeps
// focus on the text field the whole time (aria-activedescendant).
const keepFocus = (event: Event): void => event.preventDefault();

const option = (host: SuggestHost, offset: number) => (doc: SuggestDoc, at: number) =>
  html`<li id=${SUGGEST_IDS.option(offset + at)} role="option" class="suggest-option"
    aria-selected=${String(offset + at === host.active)} @click=${() => openSuggestion(host.locale)(doc)}>
    <span class="suggest-title">${doc.title}</span><small class="suggest-sub">${doc.sub}</small></li>`;

const group = (host: SuggestHost, kind: SuggestKind, label: string, docs: readonly SuggestDoc[], offset: number) =>
  branch(docs.length > 0)<TemplateResult | typeof nothing>(
    () => html`<li role="presentation" class="suggest-group">
      <strong id=${SUGGEST_IDS.heading(kind)} class="suggest-heading">${label}</strong>
      <ul role="group" aria-labelledby=${SUGGEST_IDS.heading(kind)}>${docs.map(option(host, offset))}</ul></li>`,
    () => nothing,
  );

/** The popup: a listbox of two labelled groups, and a polite status line that
 *  tells a screen reader how many suggestions there are as they change. */
export const renderSuggest = (host: SuggestHost): TemplateResult => {
  const count = flatOptions(host.groups).length;
  const status = branch(host.open)(() => host.labels.suggested.replace('{count}', String(count)), () => '');
  return html`<ul id=${SUGGEST_IDS.list} class="suggest-list" role="listbox" aria-label=${host.labels.list}
      ?hidden=${!host.open} @mousedown=${keepFocus}>
      ${group(host, 'event', host.labels.events, host.groups.events, 0)}
      ${group(host, 'venue', host.labels.venues, host.groups.venues, host.groups.events.length)}
    </ul>
    <p class="visually-hidden" role="status">${status}</p>`;
};
