import { srgbChannel } from './srgb-channel.ts';

const WEIGHTS = [0.2126, 0.7152, 0.0722];

const channelsOf = (hex: string): readonly number[] =>
  [hex.replace('#', '')]
    .map((digits) => digits.padEnd(6, '0').slice(0, 6))
    .flatMap((digits) => [0, 2, 4].map((start) => Number.parseInt(digits.slice(start, start + 2), 16)));

/** How much light a colour puts out, on WCAG's scale. */
export const relativeLuminance = (hex: string): number =>
  channelsOf(hex)
    .map(srgbChannel)
    .reduce((total, channel, index) => total + channel * (WEIGHTS[index] ?? 0), 0);
