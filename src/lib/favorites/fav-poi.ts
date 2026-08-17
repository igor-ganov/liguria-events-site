// A POI id (landmark/place) does not encode its region, and the favourites page
// / route builder would otherwise have to search every region shard to render
// it. So when a POI is favourited we also stash the little it takes to render it
// — captured from the page, which already has it. This is that little.
export type FavPoi = Readonly<{
  id: string;
  kind: 'landmark' | 'place';
  region: string;
  name: string;
  lat: number;
  lng: number;
  cat: string; // landmark kind or place category
  url: string; // localized detail path
}>;
