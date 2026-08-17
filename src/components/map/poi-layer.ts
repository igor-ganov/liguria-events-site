import type Supercluster from 'supercluster';
import { drawLayer } from './draw-layer.ts';
import { ensureShards } from './ensure-shards.ts';
import { geoPoint } from '../../lib/map/geo-point.ts';
import { loadedIndex } from '../../lib/map/loaded-index.ts';
import { pointFeatures } from '../../lib/map/point-features.ts';
import type { Marker } from 'maplibre-gl';
import type { Payload } from '../../lib/map/payload.ts';
import type { PoiLayer, PoiLayerSpec } from './poi-layer-spec.ts';

/**
 * A shard-loaded, clustered POI layer. Points arrive region by region — a
 * region's shard is fetched the first time its bbox enters the viewport, so the
 * whole country is covered without one huge file — and every arrival re-indexes
 * and redraws. Clicking a cluster zooms to the level it breaks apart at, rather
 * than listing its contents: unlike events, these are places you go and look at.
 */
export const poiLayer = <T extends Readonly<{ id: string; lat: number; lng: number }>>(
  spec: PoiLayerSpec<T>,
): PoiLayer => {
  const markers: Marker[] = [];
  const loaded = new Set<string>();
  const ids = new Set<string>();
  let items: readonly T[] = [];
  let index: Supercluster<Payload<T>> | undefined;
  const openCluster = (clusterId: number, at: [number, number]): void => {
    spec.face.map.easeTo({
      center: at,
      zoom: index?.getClusterExpansionZoom(clusterId) ?? spec.face.map.getZoom() + 2,
    });
  };
  const draw = (): void => drawLayer<T>({ ...spec.face, index, markers, openCluster });
  const merge = (added: readonly T[]): void => {
    items = [...items, ...added];
    index = loadedIndex(spec.radius, spec.maxZoom)(
      pointFeatures<T>(geoPoint)<Payload<T>>((item) => ({ item }))(items),
    );
    draw();
  };
  const ensure = (): void => {
    const { cap, home, load } = spec;
    void ensureShards<T>({ cap, home, load, merge, ids, loaded, inView: spec.inView() });
  };
  return {
    draw,
    hide: () => markers.splice(0).forEach((marker) => marker.remove()),
    show: () => {
      spec.onShow();
      ensure();
    },
    onLoad: () => [0].filter(spec.face.visible).forEach(ensure),
    onMove: () =>
      [0].filter(spec.face.visible).forEach(() => {
        draw();
        ensure();
      }),
  };
};
