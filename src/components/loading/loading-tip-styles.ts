import { css } from 'lit';

/** The card floats above the page's lower edge and takes no room in it, so
 *  showing it never moves anything (no layout shift). */
export const loadingTipStyles = css`
  :host { position: fixed; inset-inline: 0; bottom: max(1rem, env(safe-area-inset-bottom)); z-index: 40;
    display: flex; justify-content: center; padding-inline: 1rem; pointer-events: none; }
  :host([phase='idle']) { display: none; }
  /* Where the menu button floats (44rem and narrower, see global.css), the
     card sits above it rather than under a 56px circle. */
  @media (max-width: 44rem) { :host { bottom: calc(max(16px, env(safe-area-inset-bottom)) + 68px); } }
  aside { max-width: 28rem; padding: 0.75rem 1rem; border-radius: var(--radius-md, 0.8rem);
    background: var(--surface, #fff); color: var(--ink, #1b2230); border: 1px solid var(--line, #ddd);
    box-shadow: var(--shadow-md, 0 6px 18px -6px rgb(20 30 40 / 0.16)); font-size: 0.95rem; line-height: 1.4;
    animation: rise 220ms ease-out both; }
  strong { display: flex; align-items: center; gap: 0.5rem; color: var(--accent, #ef7d17); font-size: 0.8rem;
    text-transform: uppercase; letter-spacing: 0.04em; }
  p { margin: 0.3rem 0 0; }
  span { display: inline-flex; gap: 0.25rem; }
  i { width: 0.4rem; height: 0.4rem; border-radius: 50%; background: currentColor; animation: wave 1s ease-in-out infinite; }
  i:nth-child(2) { animation-delay: 120ms; }
  i:nth-child(3) { animation-delay: 240ms; }
  @keyframes rise { from { opacity: 0; transform: translateY(0.5rem); } }
  @keyframes wave { 50% { transform: translateY(-0.3rem); opacity: 0.5; } }
  @media (prefers-reduced-motion: reduce) { aside, i { animation: none; } }
`;
