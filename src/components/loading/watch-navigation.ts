import { beginLoading } from './begin-loading.ts';

const held: { end: () => void } = { end: () => undefined };

const begin = (event: Event): void => {
  held.end();
  const source: unknown = Reflect.get(event, 'sourceElement');
  held.end = beginLoading([source].filter((node): node is Element => node instanceof Element).at(0), true);
};

const end = (): void => {
  held.end();
  held.end = () => undefined;
};

/**
 * ClientRouter navigations. Astro names the link or form that started one
 * (`sourceElement`); it is busy until the new page is swapped in. Back and
 * forward have no source, and still get the tip when they run long.
 */
export const watchNavigation = (): void => {
  document.addEventListener('astro:before-preparation', begin);
  document.addEventListener('astro:after-swap', end);
};
