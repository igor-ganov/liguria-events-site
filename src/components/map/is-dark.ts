/** Whether the site is currently in its dark theme. The basemap simply follows
 *  it (there is no separate map switcher), and so does the civic layer's text. */
export const isDark = (): boolean => document.documentElement.dataset['theme'] === 'dark';
