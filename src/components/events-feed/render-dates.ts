import { html } from 'lit';
import type { TemplateResult } from 'lit';
import type { FeedHost } from './host.ts';

const onFrom = (host: FeedHost) => (event: Event): void =>
  host.ctl.setFrom((event.target as HTMLInputElement).value);
const onTo = (host: FeedHost) => (event: Event): void =>
  host.ctl.setTo((event.target as HTMLInputElement).value);

/** From/To window — mirrors the map's date range so both views filter alike. */
export const renderDates = (host: FeedHost): TemplateResult => html`
  <div class="feed-dates">
    <label>
      ${host.ui.range.from}
      <input type="date" .value=${host.from} @change=${onFrom(host)} />
    </label>
    <label>
      ${host.ui.range.to}
      <input type="date" .value=${host.to} @change=${onTo(host)} />
    </label>
  </div>
`;
