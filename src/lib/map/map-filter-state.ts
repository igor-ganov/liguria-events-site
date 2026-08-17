/** Which of the three opt-in map layers are drawn. Persisted in localStorage and
 *  overridable per-visit through the URL. */
export type MapLayerToggles = Readonly<{
  showEvents: boolean;
  showLandmarks: boolean;
  showPlaces: boolean;
}>;

/** The map's full filter state: the event filters plus the layer toggles. */
export type MapFilterState = MapLayerToggles &
  Readonly<{
    from: string;
    to: string;
    selected: readonly string[];
    freeOnly: boolean;
    gemsOnly: boolean;
  }>;
