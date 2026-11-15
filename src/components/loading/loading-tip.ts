import { html, LitElement, nothing } from 'lit';
import { loadingTipStyles } from './loading-tip-styles.ts';
import type { TipPhase } from './tip-phase.ts';

/**
 * The card shown while a load takes longer than a moment: a short fact about
 * the region or the site, or a little wave of dots while the tips themselves
 * are still on their way. Not a live region — a sentence changing every few
 * seconds would talk over the page; the load itself is announced elsewhere.
 */
export class LoadingTip extends LitElement {
  public static override properties = {
    phase: { reflect: true },
    heading: {},
    text: {},
  };

  public static override styles = loadingTipStyles;

  public phase: TipPhase = 'idle';
  public heading = '';
  public text = '';

  protected override render(): unknown {
    const dots = html`<span aria-hidden="true"><i></i><i></i><i></i></span>`;
    return html`<aside aria-label=${this.heading}>
      <strong>${dots} ${this.heading}</strong>
      ${[this.text].filter((text) => this.phase === 'tip' && text !== '').map((text) => html`<p>${text}</p>`).at(0) ?? nothing}
    </aside>`;
  }
}

customElements.define('loading-tip', LoadingTip);
