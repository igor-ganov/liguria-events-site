/** Supported site locales; en is the default (root path). */
export const LOCALES = ['en', 'it', 'ru'] as const;

export type Locale = (typeof LOCALES)[number];
