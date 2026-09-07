/** This page, and everywhere it can be left for. */
export const pageLinks = (): readonly string[] => [
  location.pathname,
  ...[...document.querySelectorAll('a[href]')].map((anchor) => anchor.getAttribute('href') ?? ''),
];
