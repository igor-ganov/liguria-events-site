import { escHtml } from './esc-html.ts';

/** Words for a screen reader only — what a decorative icon beside them means. */
export const hiddenText = (text: string): string => `<span class="visually-hidden">${escHtml(text)}</span>`;
