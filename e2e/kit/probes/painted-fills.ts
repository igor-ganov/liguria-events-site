/**
 * Which of these elements are filled by a drawn stroke rather than by a
 * background colour.
 *
 * The design paints chips, badges and pressed states with an SVG
 * `border-image` carrying the `fill` keyword. axe cannot see through that: it
 * reads the computed `background-color`, finds it transparent, and reports
 * white text on the page's cream ground at 1.04:1 — for a control that is, on
 * screen, white text on a solid terracotta pill.
 *
 * So this is not a way to silence a rule. It is the one case where the rule is
 * measuring the wrong two colours, and the site has a helper saying the same
 * thing for the same reason (e2e/is-painted.ts).
 */
export const paintedFills = (selectors: readonly string[]): string[] =>
  selectors.filter((selector) => {
    // querySelector answers with the platform's empty value; `?? undefined`
    // turns it into the one this codebase deals in before anything reads it.
    const el = document.querySelector(selector) ?? undefined;
    return [el]
      .filter((found): found is Element => found !== undefined)
      .map((found) => getComputedStyle(found))
      .some((style) => style.borderImageSource.includes('svg') && style.borderImageSlice.includes('fill'));
  });
