import { LitElement } from 'lit';
import { DEFAULT_PAGE_DATA } from '../shared/default-page-data.ts';
import { feedToday } from '../feed/feed-today.ts';
import { readJsonIsland } from '../feed/read-json-island.ts';
import { renderSuggest } from './render-suggest.ts';
import { syncCombobox } from './sync-combobox.ts';
import { wireSuggest } from './wire-suggest.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { PageData } from '../../lib/i18n/ui-schema.ts';
import type { SuggestGroups } from '../../lib/suggest/suggest-doc.ts';
import type { SuggestLabels } from './suggest-host.ts';

/**
 * The feed search as a combobox (WAI-ARIA APG, listbox popup): wraps the
 * server-rendered search field and adds suggestions of events and of the
 * venues that host such things, by letters and by meaning. Light DOM, so the
 * site's styles reach it and the field stays the one the feed already reads.
 * Thin shell: state here, behaviour in free functions.
 */
export class SearchSuggest extends LitElement {
  public static override properties = { groups: { state: true }, active: { state: true }, open: { state: true } };

  public groups: SuggestGroups = { events: [], venues: [] };
  public active = -1;
  public open = false;
  public locale: Locale = 'en';
  public labels: SuggestLabels = { list: '', events: '', venues: '', suggested: '' };
  private unwire: () => void = () => undefined;

  public override connectedCallback(): void {
    super.connectedCallback();
    const page = readJsonIsland<PageData>('ui-data', DEFAULT_PAGE_DATA);
    const { placeholder, events, venues, suggested } = page.ui.search;
    this.locale = page.lang;
    this.labels = { list: placeholder, events, venues, suggested };
    const region = document.querySelector('[data-feed-list]')?.getAttribute('data-region') ?? '';
    this.unwire = [this.field()].map((input) => wireSuggest(this, input, region, feedToday())).at(0) ?? (() => undefined);
  }

  public override disconnectedCallback(): void {
    this.unwire();
    super.disconnectedCallback();
  }

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  protected override render(): unknown {
    return renderSuggest(this);
  }

  protected override updated(): void {
    syncCombobox(this, this.field());
  }

  private field(): HTMLInputElement {
    return this.querySelector('input') ?? document.createElement('input');
  }
}

customElements.define('search-suggest', SearchSuggest);
