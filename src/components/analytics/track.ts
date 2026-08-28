type Props = Readonly<Record<string, string>>;

declare global {
  interface Window {
    pm?: (event: string, props?: Props) => void;
  }
}

/** Bridge to the pm.js beacon; a no-op when the beacon is absent (dev, blockers). */
export const track = (event: string, props?: Props): void => {
  window.pm?.(event, props);
};
