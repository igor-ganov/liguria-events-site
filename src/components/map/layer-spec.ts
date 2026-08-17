import type { ClusterIndex } from '../../lib/map/cluster-index.ts';
import type { MapLibreMap, Marker } from 'maplibre-gl';

/** How one clustered DOM-marker layer draws itself for the current viewport.
 *  `markers` is the layer's live mount list — drawLayer clears and refills it. */
export type LayerSpec<T> = Readonly<{
  map: MapLibreMap;
  prefix: string;
  anchor: 'bottom' | 'center';
  index: ClusterIndex | undefined;
  markers: Marker[];
  visible: () => boolean;
  markerEl: (item: T) => HTMLElement;
  openPoint: (item: T, at: [number, number]) => void;
  openCluster: (clusterId: number, at: [number, number]) => void;
}>;

/** The parts of a layer that never change once it is built — everything except
 *  the index it rebuilds and the markers it mounts. */
export type LayerFace<T> = Omit<LayerSpec<T>, 'index' | 'markers' | 'openCluster'>;
