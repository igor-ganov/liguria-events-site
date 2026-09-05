/** One sRGB channel, 0..255, converted to the linear light it stands for.
 *  The kink below 0.04045 is in the specification, not an approximation. */
export const srgbChannel = (value: number): number => {
  const scaled = value / 255;
  return [scaled]
    .filter((channel) => channel > 0.04045)
    .map((channel) => ((channel + 0.055) / 1.055) ** 2.4)
    .at(0) ?? scaled / 12.92;
};
