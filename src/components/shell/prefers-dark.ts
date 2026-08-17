/** The OS colour-scheme query, shared so every part of the theme shell watches
 *  one MediaQueryList. */
export const prefersDark: MediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
