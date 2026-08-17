/** Bold spans, applied AFTER escaping (the `*` markers survive escaping). */
export const inlineBold = (text: string): string =>
  text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
