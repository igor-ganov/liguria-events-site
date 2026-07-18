"""
Extract Liguria places from Overture Maps (which itself aggregates Meta,
Microsoft, TomTom and others) into scripts/.cache/overture-liguria.ndjson.

Overture's public S3 forbids anonymous LIST, so the part files are enumerated
via the bucket's HTTP listing, then read directly (GET works anonymously) with
DuckDB doing bbox + row-group pushdown. Run standalone or from build-places.ts.

  python scripts/overture-places.py
"""
import json, os, sys, urllib.parse, urllib.request, xml.etree.ElementTree as ET

BUCKET = "https://overturemaps-us-west-2.s3.amazonaws.com/"
NS = "{http://s3.amazonaws.com/doc/2006-03-01/}"
# Liguria bounding box (lon/lat), slightly generous.
BOX = (7.49, 43.75, 10.07, 44.68)
OUT = os.path.join(os.path.dirname(__file__), ".cache", "overture-liguria.ndjson")


def latest_release():
    u = BUCKET + "?list-type=2&prefix=release/&delimiter=/"
    x = ET.fromstring(urllib.request.urlopen(u, timeout=40).read())
    prefixes = [p.find(NS + "Prefix").text for p in x.findall(NS + "CommonPrefixes")]
    return sorted(prefixes)[-1].rstrip("/").split("/")[-1]


def place_parts(release):
    prefix = f"release/{release}/theme=places/type=place/"
    keys, token = [], None
    while True:
        u = BUCKET + "?list-type=2&prefix=" + urllib.parse.quote(prefix) + (
            "&continuation-token=" + urllib.parse.quote(token) if token else "")
        x = ET.fromstring(urllib.request.urlopen(u, timeout=40).read())
        for c in x.findall(NS + "Contents"):
            k = c.find(NS + "Key").text
            if k.endswith(".parquet"):
                keys.append(BUCKET + k)
        nt = x.find(NS + "NextContinuationToken")
        if nt is None:
            return keys
        token = nt.text


def main():
    import duckdb
    release = latest_release()
    urls = place_parts(release)
    print(f"Overture release {release}: {len(urls)} place part files", file=sys.stderr)
    con = duckdb.connect()
    con.execute("INSTALL httpfs; LOAD httpfs; INSTALL spatial; LOAD spatial;")
    con.execute("SET http_timeout=180000; SET http_retries=10; SET http_retry_wait_ms=1000;")
    lst = "['" + "','".join(urls) + "']"
    xmin, ymin, xmax, ymax = BOX
    rows = con.execute(f"""
        SELECT id,
               names.primary AS name,
               categories.primary AS category,
               ST_X(geometry) AS lon,
               ST_Y(geometry) AS lat,
               confidence,
               websites[1] AS website,
               phones[1] AS phone
        FROM read_parquet({lst})
        WHERE bbox.xmin BETWEEN {xmin} AND {xmax}
          AND bbox.ymin BETWEEN {ymin} AND {ymax}
          AND names.primary IS NOT NULL
          AND categories.primary IS NOT NULL
    """).fetchall()
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps({
                "id": r[0], "name": r[1], "category": r[2],
                "lat": round(r[4], 6), "lng": round(r[3], 6),
                "confidence": r[5], "website": r[6], "phone": r[7],
            }, ensure_ascii=False) + "\n")
    print(f"wrote {len(rows)} Overture places -> {OUT}", file=sys.stderr)


if __name__ == "__main__":
    main()
