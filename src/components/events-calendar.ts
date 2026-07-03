import { LitElement } from 'lit';
import type { CompactEvent } from '../lib/events/event-schema.ts';
import type { Locale } from '../lib/i18n/locales.ts';
import type { Ui } from '../lib/i18n/ui-schema.ts';
import { DEFAULT_PAGE_DATA } from './shared/default-page-data.ts';
import { makeCalendarController } from './events-calendar/controller.ts';
import { renderCalendar } from './events-calendar/render-calendar.ts';

/** Thin shell (design §2): reactive state + delegation, behaviour in free functions. */
export class EventsCalendar extends LitElement {
  public static override properties = {
    monthKey: { state: true },
    today: { state: true },
    locale: { state: true },
    ui: { state: true },
    events: { state: true },
  };

  public monthKey = '';
  public today = '';
  public locale: Locale = 'en';
  public ui: Ui = DEFAULT_PAGE_DATA.ui;
  public events: readonly CompactEvent[] = [];
  public readonly ctl = makeCalendarController(this);

  public override connectedCallback(): void {
    super.connectedCallback();
    this.ctl.init();
  }

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  protected override render(): unknown {
    return renderCalendar(this);
  }
}

customElements.define('events-calendar', EventsCalendar);
