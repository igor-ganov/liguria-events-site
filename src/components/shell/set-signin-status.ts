import { setText } from '../../lib/dom/set-text.ts';

/** The live-region line at the bottom of the sign-in dialog. */
export const setSigninStatus = (text: string): void => {
  setText(document.querySelector<HTMLElement>('#signin-status') ?? undefined, text);
};
