/**
 * Put the line on screen, with a way to take the newer version when there is
 * one.
 *
 * A button rather than a reload: swapping the page under somebody who is
 * halfway down it is not an improvement, however fresh the replacement.
 */
export const renderFreshness = (
  bar: HTMLElement,
  line: string,
  reloadLabel: string,
  offerReload: boolean,
): void => {
  bar.textContent = line;
  bar.hidden = line === '';
  [offerReload].filter(Boolean).forEach(() => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'bar-action';
    button.textContent = reloadLabel;
    button.addEventListener('click', () => location.reload());
    bar.appendChild(button);
  });
};
