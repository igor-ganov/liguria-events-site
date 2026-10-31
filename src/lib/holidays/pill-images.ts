// The hand-drawn pill of filo-mano.css (--t-pillola-*), with the colour left
// open. A chip's ring and its pressed fill are images, not borders, so the
// holiday colour reaches them only by drawing them again.
const PATH = 'M20,5 C52,2 96,4 120,6 C130,8 134,14 133,20 C132,29 126,33 114,33 C80,35 40,33 21,33 C10,32 5,27 5,20 C5,12 10,7 23,5';
const SVG = "<svg xmlns='http://www.w3.org/2000/svg' width='140' height='38'>";

const image = (svg: string): string => `url("data:image/svg+xml;utf8,${SVG}${svg}</svg>")`;

/** The pressed fill and the hover ring, in a `#rrggbb` already checked by
 *  holidayAccent. */
export const pillImages = (hex: string): Readonly<{ fill: string; ring: string }> => {
  const colour = hex.replace('#', '%23');
  return {
    fill: image(
      `<path d='${PATH} Z' fill='${colour}' stroke='${colour}' stroke-width='2.6' stroke-linejoin='round'/>`,
    ),
    ring: image(`<path d='${PATH}' fill='none' stroke='${colour}' stroke-width='1.5' stroke-linecap='round'/>`),
  };
};
