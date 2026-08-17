/** The dialog has two steps — ask for the email, then for the code it sent. */
export const showSigninStep = (step: 'email' | 'code'): void => {
  document.querySelector('[data-step="email"]')?.toggleAttribute('hidden', step !== 'email');
  document.querySelector('[data-step="code"]')?.toggleAttribute('hidden', step !== 'code');
};
