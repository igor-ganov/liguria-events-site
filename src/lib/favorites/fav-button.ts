// The favourite (heart) toggle, as an HTML string so the three card render
// paths (Astro MiniCard, the client-inserted D1 card, and the detail page) all
// emit the identical button. init-favorites wires it by delegation; CSS fills
// the heart when aria-pressed is true.
export const HEART =
  '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">' +
  '<path d="M12 20.3l-1.4-1.3C5.4 14.2 2 11.2 2 7.5 2 5 4 3 6.5 3c1.7 0 3.3.9 4.5 2.3C12.2 3.9 13.8 3 15.5 3 18 3 20 5 20 7.5c0 3.7-3.4 6.7-8.6 11.5L12 20.3z"/></svg>';

const esc = (s: string): string => s.replace(/[<>&"]/g, (c) => `&#${c.charCodeAt(0)};`);

/** A compact heart toggle for a card corner. `label` is the accessible name. */
export const favButtonHtml = (id: string, label: string): string =>
  `<button type="button" class="fav-btn" data-fav-toggle data-fav-id="${esc(id)}" aria-pressed="false" ` +
  `aria-label="${esc(label)}" title="${esc(label)}">${HEART}</button>`;
