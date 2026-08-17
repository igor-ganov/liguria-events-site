// The favourite (heart) toggle, as an HTML string so the three card render
// paths (Astro MiniCard, the client-inserted D1 card, and the detail page) all
// emit the identical button. init-favorites wires it by delegation; CSS fills
// the heart when aria-pressed is true. One value per module; this file stays the
// import surface the cards already use.
export { HEART } from './heart.ts';
export { favButtonHtml } from './fav-button-html.ts';
