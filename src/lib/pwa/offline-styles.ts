/**
 * Everything the offline page looks like, kept out of the page itself so that
 * file stays inside the size the project holds every file to.
 *
 * Inlined into the markup rather than linked: a fallback page that depends on
 * a stylesheet it might not have is not a fallback. Global, not scoped, because
 * the links on that page are created at runtime by /offline.js and a scoping
 * attribute Astro never saw matches nothing.
 */
export const OFFLINE_STYLES = `
:root { color-scheme: light dark; }
body {
  margin: 0; min-height: 100dvh; display: grid; place-items: center; padding: 2rem;
  font: 1rem/1.55 system-ui, sans-serif; text-align: center;
  background: #fbfaf7; color: #16181c;
}
main { max-width: 22rem; display: grid; gap: 0.75rem; justify-items: center; }
svg { width: 4rem; height: 5rem; }
h1 { font-size: 1.35rem; margin: 0; }
p { margin: 0; opacity: 0.75; }
button {
  margin-top: 0.5rem; padding: 0.6rem 1.4rem; border: 0; border-radius: 999px;
  background: #f2822a; color: #fff; font: inherit; font-weight: 600; cursor: pointer;
}
.kept { display: grid; gap: 0.5rem; margin-top: 1.5rem; justify-items: center; }
.kept a { color: #9c5a32; font-weight: 600; }
.kept-lead { margin: 0; }
@media (prefers-color-scheme: dark) {
  body { background: #16181c; color: #f4f2ee; }
  .kept a { color: #dd9463; }
}
    
`;
