/** The tips of one language: a small static file the worker keeps. */
export const tipsUrl = (lang: string): string => `/tips/${lang}.json`;
