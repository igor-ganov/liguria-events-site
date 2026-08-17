const CROSSHAIR =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>';

/** The "where am I" button: a plain button that is ALWAYS clickable and asks
 *  for geolocation on click, rather than maplibre's GeolocateControl — the map
 *  area is finite, so the answer needs feedback the built-in control has no
 *  room for. */
export const locateButton = (label: string): HTMLButtonElement => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'map-locate-btn';
  button.title = label;
  button.setAttribute('aria-label', label);
  button.innerHTML = CROSSHAIR;
  return button;
};
