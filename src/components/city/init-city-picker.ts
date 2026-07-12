/**
 * City picker: a button in the header that opens a filter-as-you-type list.
 * The list is server-rendered links — the script only hides the ones that do
 * not match what you typed, so the picker still works without it.
 */

// @cloudflare/workers-types shadows the DOM Element, so querySelector generics
// don't line up — narrow through the returned node instead.
const q = <T>(root: HTMLElement, sel: string): T | null =>
  (root.querySelector(sel) as unknown as T) ?? null;

const filter = (list: HTMLElement, empty: HTMLElement, term: string): void => {
  const needle = term.trim().toLowerCase();
  const rows = Array.from(list.children) as HTMLElement[];
  const shown = rows.filter((row) => {
    const hit = needle === '' || (row.dataset['name'] ?? '').includes(needle);
    row.hidden = !hit;
    return hit;
  });
  empty.hidden = shown.length > 0;
};

/** Phone: a modal bottom sheet, so it sits in the top layer and the header's
 *  backdrop-filter cannot become its containing block. Desktop: a plain
 *  non-modal dropdown anchored under the button. */
const isPhone = (): boolean => window.matchMedia('(max-width: 44rem)').matches;

const open = (pop: HTMLDialogElement, toggle: HTMLElement, search: HTMLInputElement): void => {
  if (isPhone()) pop.showModal();
  else pop.show();
  toggle.setAttribute('aria-expanded', 'true');
  search.focus();
};

const close = (pop: HTMLDialogElement, toggle: HTMLElement): void => {
  pop.close();
  toggle.setAttribute('aria-expanded', 'false');
};

const wire = (root: HTMLElement): void => {
  if (root.dataset['bound'] === 'true') return;
  root.dataset['bound'] = 'true';
  const toggle = q<HTMLElement>(root, '[data-city-toggle]');
  const pop = q<HTMLDialogElement>(root, '[data-city-pop]');
  const search = q<HTMLInputElement>(root, '[data-city-search]');
  const list = q<HTMLElement>(root, '[data-city-list]');
  const empty = q<HTMLElement>(root, '[data-city-none]');
  if (!toggle || !pop || !search || !list || !empty) return;

  toggle.addEventListener('click', () => {
    if (pop.open) close(pop, toggle);
    else open(pop, toggle, search);
  });
  // Escape and backdrop taps close a dialog on their own — keep the button's
  // state honest when they do.
  pop.addEventListener('close', () => toggle.setAttribute('aria-expanded', 'false'));
  search.addEventListener('input', () => filter(list, empty, search.value));
  // Enter on a single match goes straight there — typing "mil" + Enter is the
  // whole interaction.
  search.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const first = Array.from(list.children).find((row) => !(row as HTMLElement).hidden);
    const link = first ? (first.querySelector('a') as HTMLAnchorElement | null) : null;
    if (link) window.location.href = link.href;
  });
  document.addEventListener('click', (event) => {
    const target = event.target as Node;
    if (pop.open && !isPhone() && !root.contains(target)) close(pop, toggle);
  });
  // A modal dialog fills the sheet's box only; a tap on the backdrop lands on
  // the dialog itself, outside its content.
  pop.addEventListener('click', (event) => {
    const box = pop.getBoundingClientRect();
    const { clientX: x, clientY: y } = event as MouseEvent;
    const outside = x < box.left || x > box.right || y < box.top || y > box.bottom;
    if (outside) close(pop, toggle);
  });
};

export const initCityPicker = (): void => {
  const bind = (): void => {
    document.querySelectorAll('[data-city-picker]').forEach((node) => wire(node as HTMLElement));
  };
  bind();
  document.addEventListener('astro:page-load', bind);
};
