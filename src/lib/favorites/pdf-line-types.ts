// The layout model of the route PDF: a flat list of typed lines. Types only —
// free of any PDF library or DOM, so every producer stays unit-testable.
import type { DayBase } from './base-point.ts';
import type { Mode } from './build-route.ts';
import type { Locale } from '../i18n/locales.ts';

export type PdfLineKind = 'title' | 'day' | 'stop' | 'leg' | 'base';
export type PdfLine = Readonly<{ text: string; kind: PdfLineKind }>;

export type PdfLabels = Readonly<{ min: string; fromBase: string; toBase: string }>;
export type PdfOpts = Readonly<{
  title: string;
  lang: Locale;
  mode: Mode;
  durations: Readonly<Record<string, number>>;
  labels: PdfLabels;
  baseOf?: (day: string) => DayBase;
}>;
