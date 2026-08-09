import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { isJunkImage } from '../src/lib/img/is-junk-image.ts';

describe('isJunkImage', () => {
  test('rejects infobox maps, flags and coats of arms (real cases from the shards)', () => {
    const junk = [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Italy_North_location_map.svg?width=800',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Italy_provincial_location_map_2016.svg?width=800',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Italy_relief_location_map.jpg',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Location_map_Italy_Milan.png',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Italy_Veneto_location_map.svg',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Sicily_topographic_map-blank.svg',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_Siena.svg',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Marcaria-Stemma.png',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Catania-Bandiera_(senza_stemma).svg',
    ];
    for (const u of junk) assert.equal(isJunkImage(u), true, u);
  });

  test('keeps real place photos', () => {
    const good = [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Busalla%20-%20frazione%20Sarissola%20-%20chiesa%20di%20San%20Giorgio%20-%2003.jpg',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Ronco%20Scrivia%20(GE)%20-%20castello.jpg',
      'https://commons.wikimedia.org/wiki/Special:FilePath/La%20Spezia%20-%20Castel%20S.Giorgio.JPG',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Savignone-palazzo%20Fieschi4.jpg',
      'https://commons.wikimedia.org/wiki/Special:FilePath/Mont_Blanc_from_Aiguille_du_Midi.jpg', // "Blanc" ≠ "blank"
    ];
    for (const u of good) assert.equal(isJunkImage(u), false, u);
  });

  test('undefined/empty is not junk', () => {
    assert.equal(isJunkImage(undefined), false);
    assert.equal(isJunkImage(''), false);
  });
});
