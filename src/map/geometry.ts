// Turns longitude/latitude into screen positions and works out where
// each item's number marker belongs.

import { geoArea, geoCentroid, geoContains, geoMercator, type GeoProjection } from 'd3-geo'
import type { MultiPolygon, Polygon } from 'geojson'
import type { Item, LonLat, Region } from '../data/types'
import { findCountry } from './world'

/** A screen position in pixels: [x, y]. */
export type Pt = [number, number]

function mercatorFor(bbox: Region['bbox']): GeoProjection {
  // Center the map on the middle of the region.
  return geoMercator().rotate([-(bbox.west + bbox.east) / 2, 0])
}

/** A Mercator projection that fits the region's box exactly into width x height pixels. */
export function makeProjection(bbox: Region['bbox'], width: number, height: number): GeoProjection {
  const corners = { type: 'MultiPoint' as const, coordinates: [[bbox.west, bbox.south], [bbox.east, bbox.north]] }
  return mercatorFor(bbox)
    .fitSize([width, height], corners)
    .clipExtent([[0, 0], [width, height]])
}

/** Width divided by height of the region's map. */
export function regionAspect(bbox: Region['bbox']): number {
  const p = mercatorFor(bbox).scale(1).translate([0, 0])
  const [x1, y1] = project(p, [bbox.west, bbox.south])
  const [x2, y2] = project(p, [bbox.east, bbox.north])
  return Math.abs(x2 - x1) / Math.abs(y2 - y1)
}

export function project(projection: GeoProjection, lonLat: LonLat): Pt {
  return projection(lonLat) ?? [0, 0]
}

/**
 * Smooths a hand-placed list of points into a gentle curve (so rivers and
 * mountain shapes don't look jagged). Returns many closely spaced points.
 */
export function smoothPoints(points: Pt[], closed: boolean): Pt[] {
  const n = points.length
  if (n < 3) return points
  const at = (i: number) => (closed ? points[(i + n) % n] : points[Math.max(0, Math.min(n - 1, i))])
  const tension = 0.4 // lower = tighter corners, higher = rounder curves
  const steps = 10
  const out: Pt[] = []
  const segments = closed ? n : n - 1
  for (let i = 0; i < segments; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)]
    for (let s = 0; s < steps; s++) {
      const t = s / steps
      const h00 = 2 * t ** 3 - 3 * t ** 2 + 1
      const h10 = t ** 3 - 2 * t ** 2 + t
      const h01 = -2 * t ** 3 + 3 * t ** 2
      const h11 = t ** 3 - t ** 2
      const curve = (k: 0 | 1) =>
        h00 * p1[k] + h10 * tension * (p2[k] - p0[k]) + h01 * p2[k] + h11 * tension * (p3[k] - p1[k])
      out.push([curve(0), curve(1)])
    }
  }
  if (!closed) out.push(points[n - 1])
  return out
}

/** Turns a list of points into an SVG path string. */
export function toSvgPath(points: Pt[], closed: boolean): string {
  const body = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L')
  return `M${body}${closed ? 'Z' : ''}`
}

/** The point halfway along a line. */
export function midpointAlong(points: Pt[]): Pt {
  const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]))
  let remaining = lengths.reduce((a, b) => a + b, 0) / 2
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i]) {
      const t = lengths[i] === 0 ? 0 : remaining / lengths[i]
      const [a, b] = [points[i], points[i + 1]]
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
    }
    remaining -= lengths[i]
  }
  return points[points.length - 1]
}

/** The center of a flat shape (standard "centroid" formula). */
function polygonCentroid(points: Pt[]): Pt {
  let area = 0
  let cx = 0
  let cy = 0
  points.forEach(([x1, y1], i) => {
    const [x2, y2] = points[(i + 1) % points.length]
    const cross = x1 * y2 - x2 * y1
    area += cross
    cx += (x1 + x2) * cross
    cy += (y1 + y2) * cross
  })
  if (area === 0) return points[0]
  return [cx / (3 * area), cy / (3 * area)]
}

/** A country's center. If that lands outside the country (like Japan's curve), use its biggest piece. */
function countryCenter(name: string): LonLat | null {
  const country = findCountry(name)
  if (!country) return null
  const center = geoCentroid(country)
  if (geoContains(country, center) || country.geometry.type !== 'MultiPolygon') return center
  const pieces: Polygon[] = (country.geometry as MultiPolygon).coordinates.map((coordinates) => ({
    type: 'Polygon',
    coordinates,
  }))
  const biggest = pieces.reduce((a, b) => (geoArea(b) > geoArea(a) ? b : a))
  return geoCentroid(biggest)
}

/** The projected screen points for a line or polygon item, already smoothed. */
export function itemScreenPoints(item: Item, projection: GeoProjection): Pt[] {
  const g = item.geometry
  if (g.kind !== 'line' && g.kind !== 'polygon') return []
  return smoothPoints(
    g.coords.map((c) => project(projection, c)),
    g.kind === 'polygon',
  )
}

/** Where an item's marker naturally belongs, before moving it to avoid overlaps. */
export function markerAnchor(item: Item, projection: GeoProjection): Pt | null {
  if (item.markerLonLat) return project(projection, item.markerLonLat)
  const g = item.geometry
  switch (g.kind) {
    case 'point':
      return project(projection, g.lonLat)
    case 'line':
      return midpointAlong(itemScreenPoints(item, projection))
    case 'polygon':
      return polygonCentroid(itemScreenPoints(item, projection))
    case 'country': {
      const center = countryCenter(g.worldAtlasName)
      return center ? project(projection, center) : null
    }
  }
}
