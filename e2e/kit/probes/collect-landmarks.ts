/** Which of the page's structural parts actually rendered with a size. A
 *  header that stops laying out at one width is present in the DOM and absent
 *  from the page; only the rectangle tells them apart. */
export const collectLandmarks = (): string[] =>
  ['header', 'main', 'footer', 'nav'].filter((tag) => {
    const el = document.querySelector(tag);
    const rect = el?.getBoundingClientRect();
    return Boolean(rect && rect.width > 0 && rect.height > 0);
  });
