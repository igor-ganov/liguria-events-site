import type { StyleSpecification } from 'maplibre-gl';
import brightJson from './bright.json';

// JSON style modules infer a wider literal type than MapLibre's
// StyleSpecification; assert once on this export line (the sanctioned boundary)
// so map modules import a typed style with no inline cast.
export const brightStyle = brightJson as unknown as StyleSpecification;
