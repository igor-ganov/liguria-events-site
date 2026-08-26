/** A stop, drawn as a circle that stops just short of closing. */
export const stopMark = (y: number, madeHere: boolean): string => {
  const kind = ['', ' percorso__nodo--nostra'][Number(madeHere)] ?? '';
  return `<path class="percorso__nodo${kind}" transform="translate(2,${y - 7})" d="M7.3,1.7 C10.4,1.8 12.4,4.2 12.3,7.1 C12.2,10.2 9.9,12.4 7,12.3 C3.9,12.2 1.7,9.9 1.8,7 C1.9,4.1 4.2,1.9 7.9,2"/>`;
};
