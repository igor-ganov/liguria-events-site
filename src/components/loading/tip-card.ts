/** The tip card of the page on screen now: a new one arrives with every page. */
export const tipCard = (): HTMLElement | undefined => document.querySelector<HTMLElement>('loading-tip') ?? undefined;
