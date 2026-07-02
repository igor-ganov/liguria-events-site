import { LitElement } from 'lit';
import type { CompactEvent } from '../lib/events/event-schema.ts';
import { makeCalendarController } from './events-calendar/controller.ts';
import { renderCalendar } from './events-calendar/render-calendar.ts';

/** Thin shell (design §2): reactive state + delegation, behaviour in free functions. */
export class EventsCalendar extends LitElement {
  public static override properties = {
    monthKey: { state: true },
    today: { state: true },
    events: { state: true },
  };

  public monthKey = '';
  public today = '';
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
