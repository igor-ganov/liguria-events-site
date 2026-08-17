import type { LayerFace } from './layer-spec.ts';

/**
 * A shard-loaded POI layer, described. Landmarks and places are the same
 * machine with different faces, popups and budgets: `radius`/`maxZoom` are the
 * clustering budget, `cap` the number of in-view regions past which shards stop
 * loading (places are dense venues — all-Italy is ~100 MB — while landmarks are
 * few and pass Infinity), and `onShow` is whatever the layer says for itself
 * when it is switched on.
 */
export type PoiLayerSpec<T> = Readonly<{
  face: LayerFace<T>;
  radius: number;
  maxZoom: number;
  cap: number;
  home: string | undefined;
  inView: () => readonly string[];
  load: (region: string) => Promise<readonly T[]>;
  onShow: () => void;
}>;

/** What a POI layer offers the rest of the page. */
export type PoiLayer = Readonly<{
  draw: () => void;
  hide: () => void;
  show: () => void;
  onLoad: () => void;
  onMove: () => void;
}>;
