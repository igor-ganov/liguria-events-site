import maplibregl from 'maplibre-gl';
import { boundsBbox } from '../../lib/map/bounds-bbox.ts';
import { branch } from '../../lib/branch.ts';
import { clusterInfo } from '../../lib/map/cluster-info.ts';
import { clusterMarkerEl } from './cluster-marker-el.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { lngLat } from '../../lib/map/lng-lat.ts';
import { pointPayload } from '../../lib/map/point-payload.ts';
import type { ClusterPoint } from '../../lib/map/cluster-index.ts';
import type { LayerSpec } from './layer-spec.ts';
import type { Marker } from 'maplibre-gl';

// A marker click must not also reach the map, or the popup it just opened is
// closed again by the map's own click handling.
const onClick = (el: HTMLElement, run: () => void): void => {
  el.addEventListener('click', (event) => {
    event.stopPropagation();
    run();
  });
};

const mount = <T>(spec: LayerSpec<T>, el: HTMLElement, at: [number, number]): Marker =>
  new maplibregl.Marker({ element: el, anchor: spec.anchor }).setLngLat(at).addTo(spec.map);

const drawOne =
  <T>(spec: LayerSpec<T>) =>
  (feature: ClusterPoint): Marker => {
    const at = lngLat(feature.geometry.coordinates);
    const info = clusterInfo(feature.properties);
    return branch(info.cluster)(
      () => {
        const el = clusterMarkerEl(spec.prefix)(info.count);
        onClick(el, () => spec.openCluster(info.clusterId, at));
        return mount(spec, el, at);
      },
      () => {
        const item = pointPayload<T>(feature.properties);
        const el = spec.markerEl(item);
        onClick(el, () => spec.openPoint(item, at));
        return mount(spec, el, at);
      },
    );
  };

/**
 * Redraw a clustered marker layer for the current viewport: drop the previous
 * markers, then mount one DOM marker per cluster or point supercluster reports
 * for the visible bbox. A layer with no index, or one switched off, ends up
 * simply cleared — which is exactly what hiding it means.
 */
export const drawLayer = <T>(spec: LayerSpec<T>): void => {
  spec.markers.splice(0).forEach((marker) => marker.remove());
  [spec.index]
    .filter(isDefined)
    .filter(spec.visible)
    .forEach((index) => {
      const bbox = boundsBbox(spec.map.getBounds());
      index
        .getClusters(bbox, Math.round(spec.map.getZoom()))
        .forEach((feature) => spec.markers.push(drawOne(spec)(feature)));
    });
};
