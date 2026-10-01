/** Minimal geometry for lake FTL buffer checks. Coordinates are [lng, lat] (GeoJSON order). */

export type Ring = [number, number][];
export interface LakePolygon {
  name: string;
  rings: Ring[]; // first is outer boundary, rest are holes
}

const R = 6_371_000;

/** Local equirectangular projection to metres around a reference latitude. Accurate to <0.5% at city scale. */
function project([lng, lat]: [number, number], refLat: number): [number, number] {
  const x = ((lng * Math.PI) / 180) * R * Math.cos((refLat * Math.PI) / 180);
  const y = ((lat * Math.PI) / 180) * R;
  return [x, y];
}

function pointInRing(pt: [number, number], ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function pointInPolygon(pt: [number, number], poly: LakePolygon): boolean {
  if (!pointInRing(pt, poly.rings[0])) return false;
  return !poly.rings.slice(1).some((h) => pointInRing(pt, h));
}

function segDistance(p: [number, number], a: [number, number], b: [number, number]): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  const cx = a[0] + t * dx;
  const cy = a[1] + t * dy;
  return Math.hypot(p[0] - cx, p[1] - cy);
}

/** Distance in metres from a point to the polygon edge; 0 if inside. */
export function distanceToPolygonMeters(pt: [number, number], poly: LakePolygon): number {
  if (pointInPolygon(pt, poly)) return 0;
  const refLat = pt[1];
  const p = project(pt, refLat);
  let best = Infinity;
  for (const ring of poly.rings) {
    for (let i = 0; i < ring.length - 1; i++) {
      const d = segDistance(p, project(ring[i], refLat), project(ring[i + 1], refLat));
      if (d < best) best = d;
    }
  }
  return best;
}

/** Parse a GeoJSON FeatureCollection of Polygon / MultiPolygon lake FTL boundaries. */
export function parseLakes(geojson: unknown): LakePolygon[] {
  const out: LakePolygon[] = [];
  const fc = geojson as { features?: { properties?: Record<string, unknown>; geometry?: { type: string; coordinates: unknown } }[] };
  for (const f of fc.features ?? []) {
    const name = String(f.properties?.name ?? f.properties?.NAME ?? f.properties?.lake_name ?? 'Unnamed lake');
    const g = f.geometry;
    if (!g) continue;
    if (g.type === 'Polygon') out.push({ name, rings: g.coordinates as Ring[] });
    if (g.type === 'MultiPolygon') for (const poly of g.coordinates as Ring[][]) out.push({ name, rings: poly });
  }
  return out;
}

export interface BufferResult {
  lake: string;
  distanceMeters: number;
  insideFtl: boolean;
  insideBuffer: boolean;
}

export function nearestLake(lat: number, lng: number, lakes: LakePolygon[], bufferMeters = 30): BufferResult | null {
  let best: BufferResult | null = null;
  for (const lake of lakes) {
    const d = distanceToPolygonMeters([lng, lat], lake);
    if (!best || d < best.distanceMeters) {
      best = { lake: lake.name, distanceMeters: Math.round(d), insideFtl: d === 0, insideBuffer: d <= bufferMeters };
    }
  }
  return best;
}
