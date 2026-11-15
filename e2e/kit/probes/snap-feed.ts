/**
 * Installed in every document (addInitScript): writes what the feed shows right
 * now as one line, on request — a `feed-snap` event names the sessionStorage
 * list to append it to. Self-contained, because Playwright prints it into the
 * page.
 *
 * The line holds whether the feed is shown at all, the scroll position, the
 * first card under the header, the cards shown in their order (as a count and
 * a hash, so a frame that differs anywhere differs here) and the state of every
 * control: the sort, the chips, the search, the folded days. "absent" is a
 * frame with no feed in it yet — the page being left.
 */
export const snapFeed = (): void => {
  const hash = (text: string): string =>
    [...text].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) | 0, 7).toString(36);
  const pressed = (sel: string): string =>
    [...document.querySelectorAll(`${sel}[aria-pressed="true"]`)].map((el) => el.outerHTML.split('>')[0]).join(',');
  const firstUnderHead = (cards: readonly HTMLElement[]): string => {
    const head = Math.max(document.querySelector('.site-head')?.getBoundingClientRect().bottom ?? 0, 0);
    return cards.find((li) => li.getBoundingClientRect().bottom > head + 1)?.dataset['id'] ?? '-';
  };
  const visible = (el: Element | undefined): boolean => [el].every((it) => it === undefined || getComputedStyle(it).visibility === 'visible');
  const describe = (list: Element): string => {
    const cards = [...document.querySelectorAll<HTMLElement>('.feed-list > li')].filter((li) => !li.hidden && li.getClientRects().length > 0);
    const ids = cards.map((li) => li.dataset['id']).join(',');
    const search = document.querySelector<HTMLInputElement>('[data-feed-search]')?.value ?? '';
    const shut = [...document.querySelectorAll<HTMLElement>('.feed-group[data-shut]')].map((day) => day.dataset['day']).join(',');
    const controls = [pressed('.chip'), search, shut].join(';');
    const shown = visible(list) && visible(document.querySelector('main') ?? undefined);
    return [shown, Math.round(scrollY), firstUnderHead(cards), `${cards.length}#${hash(ids)}`, controls].join('|');
  };
  const snap = (): string =>
    [document.querySelector('[data-feed-list]')].filter((list): list is Element => list instanceof Element).map(describe)[0] ?? 'absent';
  addEventListener('feed-snap', (event) => {
    const key = [event].filter((it): it is CustomEvent => it instanceof CustomEvent).map((it) => String(it.detail))[0] ?? '';
    sessionStorage.setItem(key, JSON.stringify([...JSON.parse(sessionStorage.getItem(key) ?? '[]'), snap()]));
  });
};
