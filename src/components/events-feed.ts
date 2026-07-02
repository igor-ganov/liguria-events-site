import { LitElement } from 'lit';
import type { Category } from '../lib/events/categories.ts';
import type { CompactEvent } from '../lib/events/event-schema.ts';
import { makeFeedController } from './events-feed/controller.ts';
import { renderFeed } from './events-feed/render-feed.ts';

/** Thin shell (design §2): reactive state + delegation, behaviour in free functions. */
export class EventsFeed extends LitElement {
  public static override properties = {
    today: { state: true },
    events: { state: true },
    selected: { state: true },
    freeOnly: { state: true },
    gemsOnly: { state: true },
  };

  public today = '';
  public events: readonly CompactEvent[] = [];
  public selected: readonly Category[] = [];
  public freeOnly = false;
  public gemsOnly = false;
  public readonly ctl = makeFeedController(this);

  public override connectedCallback(): void {
    super.connectedCallback();
    this.ctl.init();
  }

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  protected override render(): unknown {
    return renderFeed(this);
  }
}

customElements.define('events-feed', EventsFeed);
