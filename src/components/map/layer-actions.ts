/** What flipping one of the three layer chips has to do to the map, once the
 *  state and the URL have already been updated. */
export type LayerActions = Readonly<{
  drawEvents: () => void;
  showLandmarks: () => void;
  hideLandmarks: () => void;
  showPlaces: () => void;
  hidePlaces: () => void;
}>;
