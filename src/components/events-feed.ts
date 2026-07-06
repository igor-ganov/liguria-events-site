import { LitElement } from 'lit';
import type { Category } from '../lib/events/categories.ts';
import type { CompactEvent } from '../lib/events/event-schema.ts';
import type { Locale } from '../lib/i18n/locales.ts';
import type { Ui } from '../lib/i18n/ui-schema.ts';
import { DEFAULT_PAGE_DATA } from './shared/default-page-data.ts';
import { makeFeedController } from './events-feed/controller.ts';
import { renderFeed } from './events-feed/render-feed.ts';

/** Thin shell (design §2): reactive state + delegation, behaviour in free functions. */
export class EventsFeed extends LitElement {
  public static override properties = {
    today: { state: true },
    locale: { state: true },
    ui: { state: true },
    events: { state: true },
    selected: { state: true },
    freeOnly: { state: true },
    gemsOnly: { state: true },
    from: { state: true },
    to: { state: true },
  };

  public today = '';
  public locale: Locale = 'en';
  public ui: Ui = DEFAULT_PAGE_DATA.ui;
  public events: readonly CompactEvent[] = [];
  public selected: readonly Category[] = [];
  public freeOnly = false;
  public gemsOnly = false;
  public from = '';
  public to = '';
  public readonly ctl = makeFeedController(this);

  public override connectedCallback(): void {
    super.connectedCallback();
    this.ctl.init();
    void this.ctl.augment();
  }

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  protected override render(): unknown {
    return renderFeed(this);
  }
}

customElements.define('events-feed', EventsFeed);
