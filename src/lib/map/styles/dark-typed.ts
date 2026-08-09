import type { StyleSpecification } from 'maplibre-gl';
import darkJson from './dark.json';

// See bright-typed.ts — the JSON→StyleSpecification assertion lives on the
// export line so importers stay cast-free.
export const darkStyle = darkJson as unknown as StyleSpecification;
