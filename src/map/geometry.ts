// Turns longitude/latitude into screen positions and works out where
// each item's number marker belongs.

import { geoArea, geoCentroid, geoContains, geoMercator, geoPath, type GeoProjection } from 'd3-geo'
import type { MultiPolygon, Polygon } from 'geojson'
import type { Item, LonLat, Region } from '../data/types'
import { findShape, type CountryFeature } from './world'

/** A screen position in pixels: [x, y]. */
export type Pt = [number, number]

function mercatorFor(bbox: Region['bbox']): GeoProjection {
  // Center the map on the middle of the region.
  return geoMercator().rotate([-(bbox.west + bbox.east) / 2, 0])
}

/**
 * A Mercator projection that fits the region's box inside width x height pixels,
 * leaving a margin of `padding` pixels. If the space is a different shape than the
 * region, the extra room shows the surrounding area.
 */
export function makeProjection(bbox: Region['bbox'], width: number, height: number, padding = 0): GeoProjection {
  const corners = { type: 'MultiPoint' as const, coordinates: [[bbox.west, bbox.south], [bbox.east, bbox.north]] }
  return mercatorFor(bbox)
    .fitExtent([[padding, padding], [width - padding, height - padding]], corners)
    .clipExtent([[0, 0], [width, height]])
}

/** The longitudes and latitudes at the edges of the drawn map (this can be more than the region's box). */
export function visibleBounds(projection: GeoProjection, width: number, height: number): Region['bbox'] {
  const [west, north] = projection.invert?.([0, 0]) ?? [-180, 90]
  const [east, south] = projection.invert?.([width, height]) ?? [180, -90]
  // If the view crosses the 180° line, keep east as a number bigger than west.
  return { west, south, east: east < west ? east + 360 : east, north }
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
function countryCenter(country: CountryFeature): LonLat {
  const center = geoCentroid(country)
  if (geoContains(country, center) || country.geometry.type !== 'MultiPolygon') return center
  const pieces: Polygon[] = (country.geometry as MultiPolygon).coordinates.map((coordinates) => ({
    type: 'Polygon',
    coordinates,
  }))
  const biggest = pieces.reduce((a, b) => (geoArea(b) > geoArea(a) ? b : a))
  return geoCentroid(biggest)
}

/**
 * A point that is truly on the country's own land (and inside `bounds`): slice the
 * country with east-west lines and take the middle of the widest stretch of land.
 * Holes and neighbors inside the outline (like the West Bank inside Israel) are
 * skipped automatically, because each line switches between "in" and "out" at every edge.
 */
function pointOnLand(country: CountryFeature, bounds: Region['bbox']): LonLat | null {
  const g = country.geometry
  const polygons = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : []
  const rings = polygons.flat()
  let south = bounds.north
  let north = bounds.south
  for (const ring of rings) {
    for (const [, lat] of ring) {
      south = Math.min(south, lat)
      north = Math.max(north, lat)
    }
  }
  south = Math.max(south, bounds.south)
  north = Math.min(north, bounds.north)
  if (!(south < north)) return null

  const SLICES = 25
  let best: { lonLat: LonLat; width: number } | null = null
  for (let k = 1; k < SLICES; k++) {
    const lat = south + ((north - south) * k) / SLICES
    // Where this line crosses the country's edges, west to east.
    const crossings: number[] = []
    for (const ring of rings) {
      for (let i = 0; i < ring.length - 1; i++) {
        const [x1, y1] = ring[i]
        const [x2, y2] = ring[i + 1]
        if (y1 > lat !== y2 > lat) crossings.push(x1 + ((lat - y1) * (x2 - x1)) / (y2 - y1))
      }
    }
    crossings.sort((a, b) => a - b)
    // Crossings come in pairs: land runs from each odd crossing to the next one.
    for (let i = 0; i + 1 < crossings.length; i += 2) {
      const from = Math.max(crossings[i], bounds.west)
      const to = Math.min(crossings[i + 1], bounds.east)
      const width = (to - from) * Math.cos((lat * Math.PI) / 180) // true east-west width
      if (width > (best?.width ?? 0)) best = { lonLat: [(from + to) / 2, lat], width }
    }
  }
  return best?.lonLat ?? null
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

// ---- Keeping numbers inside the region ----

/** A rectangle on screen: [left, top, right, bottom]. */
type Box = [number, number, number, number]

/** The region's box in screen pixels. */
function screenBox(projection: GeoProjection, bbox: Region['bbox']): Box {
  const [left, top] = project(projection, [bbox.west, bbox.north])
  const [right, bottom] = project(projection, [bbox.east, bbox.south])
  return [left, top, right, bottom]
}

function isInside([x, y]: Pt, [left, top, right, bottom]: Box): boolean {
  return x >= left && x <= right && y >= top && y <= bottom
}

function lineLength(points: Pt[]): number {
  return points.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - points[i][0], p[1] - points[i][1]), 0)
}

/**
 * The part of the straight segment a-b that is inside the box, or null if none is.
 * Also says whether that part starts or ends at the box's edge (rather than at a or b).
 */
function clipSegment(a: Pt, b: Pt, [left, top, right, bottom]: Box) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  let start = 0 // how far along a-b (0 to 1) the inside part starts
  let end = 1 // and where it ends
  const edges: [number, number][] = [
    [-dx, a[0] - left],
    [dx, right - a[0]],
    [-dy, a[1] - top],
    [dy, bottom - a[1]],
  ]
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return null // runs alongside this edge, outside it
      continue
    }
    const t = q / p
    if (p < 0) {
      if (t > end) return null
      start = Math.max(start, t)
    } else {
      if (t < start) return null
      end = Math.min(end, t)
    }
  }
  const at = (t: number): Pt => [a[0] + t * dx, a[1] + t * dy]
  return { from: at(start), to: at(end), startsAtEdge: start > 0, endsAtEdge: end < 1 }
}

/** Cuts a line into the pieces inside the box and returns the longest piece. */
function longestPieceInside(points: Pt[], box: Box): Pt[] {
  const pieces: Pt[][] = []
  let piece: Pt[] | null = null
  for (let i = 0; i < points.length - 1; i++) {
    const clipped = clipSegment(points[i], points[i + 1], box)
    if (!clipped) {
      piece = null
      continue
    }
    if (!piece || clipped.startsAtEdge) {
      piece = [clipped.from] // the line (re-)enters the box here
      pieces.push(piece)
    }
    piece.push(clipped.to)
    if (clipped.endsAtEdge) piece = null // the line leaves the box here
  }
  return pieces.reduce((best, p) => (lineLength(p) > lineLength(best) ? p : best), [] as Pt[])
}

/** True if the point is inside the shape outlined by `points` (counts how many edges a line to the right crosses). */
function isInShape([x, y]: Pt, points: Pt[]): boolean {
  let inside = false
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i]
    const [xj, yj] = points[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

/**
 * The middle of the widest stretch across a shape: slice it with horizontal lines
 * (inside the box) and take the middle of the longest piece of any slice.
 */
function middleOfWidestStretch(points: Pt[], [left, top, right, bottom]: Box): Pt | null {
  const ys = points.map((p) => p[1])
  const from = Math.max(Math.min(...ys), top)
  const to = Math.min(Math.max(...ys), bottom)
  if (!(from < to)) return null
  const SLICES = 25
  let best: { spot: Pt; width: number } | null = null
  for (let k = 1; k < SLICES; k++) {
    const y = from + ((to - from) * k) / SLICES
    const crossings: number[] = []
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const [xi, yi] = points[i]
      const [xj, yj] = points[j]
      if (yi > y !== yj > y) crossings.push(xi + ((y - yi) * (xj - xi)) / (yj - yi))
    }
    crossings.sort((a, b) => a - b)
    for (let i = 0; i + 1 < crossings.length; i += 2) {
      const start = Math.max(crossings[i], left)
      const end = Math.min(crossings[i + 1], right)
      if (end - start > (best?.width ?? 0)) best = { spot: [(start + end) / 2, y], width: end - start }
    }
  }
  return best?.spot ?? null
}

/** Trims a shape to the part inside the box (a standard "polygon clipping" method, one box edge at a time). */
function clipPolygonToBox(points: Pt[], [left, top, right, bottom]: Box): Pt[] {
  const crossAtX = (a: Pt, b: Pt, x: number): Pt => [x, a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0])]
  const crossAtY = (a: Pt, b: Pt, y: number): Pt => [a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]), y]
  const edges: { inside: (p: Pt) => boolean; cross: (a: Pt, b: Pt) => Pt }[] = [
    { inside: (p) => p[0] >= left, cross: (a, b) => crossAtX(a, b, left) },
    { inside: (p) => p[0] <= right, cross: (a, b) => crossAtX(a, b, right) },
    { inside: (p) => p[1] >= top, cross: (a, b) => crossAtY(a, b, top) },
    { inside: (p) => p[1] <= bottom, cross: (a, b) => crossAtY(a, b, bottom) },
  ]
  let result = points
  for (const edge of edges) {
    const input = result
    result = []
    input.forEach((current, i) => {
      const previous = input[(i + input.length - 1) % input.length]
      if (edge.inside(current)) {
        if (!edge.inside(previous)) result.push(edge.cross(previous, current))
        result.push(current)
      } else if (edge.inside(previous)) {
        result.push(edge.cross(previous, current))
      }
    })
    if (result.length === 0) break
  }
  return result
}

/**
 * Where an item's marker naturally belongs, before moving it to avoid overlaps.
 * If a river's halfway point (or a shape's or country's center) is outside the
 * region, the number goes on the part that is inside, so it can always be seen
 * and tapped. A country's number always lands on that country's own land, and a
 * shape's number always lands inside the shape itself.
 * A hand-set markerLonLat always wins.
 */
export function markerAnchor(item: Item, projection: GeoProjection, bbox: Region['bbox']): Pt | null {
  if (item.markerLonLat) return project(projection, item.markerLonLat)
  const g = item.geometry
  switch (g.kind) {
    case 'point':
      return project(projection, g.lonLat)
    case 'line': {
      const points = itemScreenPoints(item, projection)
      const middle = midpointAlong(points)
      const box = screenBox(projection, bbox)
      if (isInside(middle, box)) return middle
      const piece = longestPieceInside(points, box)
      return piece.length >= 2 ? midpointAlong(piece) : middle
    }
    case 'polygon': {
      const points = itemScreenPoints(item, projection)
      const box = screenBox(projection, bbox)
      // A good spot is inside the shape itself AND inside the region.
      const isGoodSpot = (p: Pt | null): p is Pt => !!p && isInside(p, box) && isInShape(p, points)

      // 1. The shape's center.
      const center = polygonCentroid(points)
      if (isGoodSpot(center)) return center

      // 2. The center of the part of the shape inside the region.
      const trimmed = clipPolygonToBox(points, box)
      const trimmedCenter = trimmed.length >= 3 ? polygonCentroid(trimmed) : null
      if (isGoodSpot(trimmedCenter)) return trimmedCenter

      // 3. The middle of the widest stretch across the shape (for long, curved bands).
      const across = middleOfWidestStretch(points, box)
      if (isGoodSpot(across)) return across

      return center // nothing better found (shouldn't happen)
    }
    case 'country':
    case 'province': {
      // (Provinces and territories follow exactly the same rules as countries.)
      // A tiny country with a diamond marker: its number belongs by the diamond.
      if (g.dotLonLat) return project(projection, g.dotLonLat)
      const country = findShape(g)
      if (!country) return null
      const box = screenBox(projection, bbox)
      // A good spot is on the country's own land AND inside the region.
      const isGoodSpot = (lonLat: LonLat | null | undefined): lonLat is LonLat =>
        !!lonLat && geoContains(country, lonLat) && isInside(project(projection, lonLat), box)

      // 1. The country's center (or its biggest piece's center).
      const center = countryCenter(country)
      if (isGoodSpot(center)) return project(projection, center)

      // 2. The center of the part of the country inside the region: draw the country
      //    trimmed to the region's box (on a copy of the map's projection) and take its center.
      const trimmedView = geoMercator()
        .rotate(projection.rotate())
        .scale(projection.scale())
        .translate(projection.translate())
        .clipExtent([[box[0], box[1]], [box[2], box[3]]])
      const trimmedCenter = geoPath(trimmedView).centroid(country)
      const trimmedLonLat = Number.isFinite(trimmedCenter[0]) ? projection.invert?.(trimmedCenter) : null
      if (isGoodSpot(trimmedLonLat)) return project(projection, trimmedLonLat)

      // 3. The middle of the widest stretch of the country's land inside the region.
      const onLand = pointOnLand(country, bbox)
      if (isGoodSpot(onLand)) return project(projection, onLand)

      return project(projection, center) // nothing better found (shouldn't happen)
    }
  }
}
