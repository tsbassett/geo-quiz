// Draws one region's map: land, shaded areas, rivers, city dots, and markers.
// It works for any region, driven entirely by the region's data file.
//
// Zooming: the geography sits in one group that d3-zoom scales and moves.
// Markers, city dots, and pointer lines are drawn outside that group at their
// zoomed positions, so they move with the map but stay the same size.

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { geoPath } from 'd3-geo'
import { select } from 'd3-selection'
import { zoom, zoomIdentity, type D3ZoomEvent, type ZoomBehavior, type ZoomTransform } from 'd3-zoom'
import type { Item, ItemType, Region } from '../data/types'
import { useElementSize } from '../hooks/useElementSize'
import { itemScreenPoints, makeProjection, markerAnchor, project, toSvgPath, visibleBounds, type Pt } from './geometry'
import { spreadMarkers, type MarkerBox, type Obstacle } from './layout'
import { countriesNear, findShape } from './world'

export type MarkerState =
  | 'normal'
  | 'selected'
  | 'answered'
  | 'bankAnswered'
  | 'bankSelected'
  | 'correct'
  | 'incorrect'

interface RegionMapProps {
  region: Region
  /** Items that get a marker (usually all of them; "Review missed" uses fewer). */
  markedItems: Item[]
  /** What each marker shows: a number, or the name in Study mode. */
  markerText: Record<string, string>
  markerStates?: Record<string, MarkerState>
  /** An item whose shape is drawn highlighted in blue. */
  highlightId?: string | null
  onItemTap?: (id: string) => void
  /** Also accept taps on country shapes, rivers, and shaded areas (used in Study mode). */
  tapShapes?: boolean
  /** Items already solved; they are drawn faded so unsolved ones stand out (used in Practice). */
  doneIds?: ReadonlySet<string>
}

const NO_IDS: ReadonlySet<string> = new Set()

const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
const FONT_SIZE = 16
const NUMBER_RADIUS = 16 // 32px circles
const PILL_HALF_H = 15 // name labels are 30px tall
const PILL_PAD_X = 10
const CITY_DOT_RADIUS = 4.5
const STAR_OUTER_RADIUS = 10 // a selected city's star is about 19px across
const STAR_INNER_RADIUS = 4.2
const COUNTRY_DOT_SIZE = 7 // a tiny country's diamond is 14px from tip to tip
const COUNTRY_DOT_SIZE_SELECTED = 9

const MAP_PADDING = 10 // pixels of margin between the region and the edge of the map

const MAX_ZOOM = 8 // 1 = the default fit
const ZOOM_STEP = 1.6 // how much the + and - buttons zoom
const TAP_TOLERANCE = 6 // a press that moves less than this many pixels still counts as a tap

const COLORS = {
  water: '#f3f7fb',
  land: '#d6d6d6',
  border: '#6b7280',
  cityDot: '#111827',
  cityStar: '#facc15',
  cityStarOutline: '#854d0e',
  countryDotOutline: '#374151',
  leader: '#374151',
  highlight: '#2563eb',
  highlightFill: '#bfdbfe',
  // Faded look for solved items
  doneCountry: '#d3e6cc',
  doneRiver: '#a9bfa6',
  doneCity: '#c7c7c7',
}
const DONE_AREA_OPACITY = 0.35 // solved deserts, mountains, plateaus, lakes, and reefs fade to this

// How lines are drawn. Canals are teal and thicker than rivers, so even a short one shows.
const LINE_LOOKS = {
  river: { color: '#1e40af', selectedColor: '#3b82f6', width: 2.5, selectedWidth: 4 },
  canal: { color: '#0f766e', selectedColor: '#14b8a6', width: 5, selectedWidth: 7 },
}
const DONE_LINE_WIDTH = 1.5 // solved rivers and canals get thinner

// Shape types drawn with a solid color instead of hatching.
const SOLID_AREAS: Partial<Record<ItemType, { fill: string; edge: string }>> = {
  lake: { fill: '#d4e5f5', edge: '#7fa7cf' }, // a little bluer than the ocean, so it stands out on gray land
  reef: { fill: '#9fded2', edge: '#2a9d8f' }, // light teal, so it stands out on the ocean
}

const MARKER_COLORS: Record<MarkerState, { fill: string; stroke: string; text: string; ring?: string }> = {
  normal: { fill: '#ffffff', stroke: '#1f2937', text: '#1f2937' },
  selected: { fill: '#2563eb', stroke: '#1e3a8a', text: '#ffffff' },
  answered: { fill: '#e0e7ff', stroke: '#4338ca', text: '#312e81' }, // Test (Type It): answered, not graded yet
  bankAnswered: { fill: '#2563eb', stroke: '#1e3a8a', text: '#ffffff' }, // Test (Word Bank): has an answer
  bankSelected: { fill: '#2563eb', stroke: '#1e3a8a', text: '#ffffff', ring: '#f97316' }, // Test (Word Bank): selected
  correct: { fill: '#16a34a', stroke: '#14532d', text: '#ffffff' },
  incorrect: { fill: '#dc2626', stroke: '#7f1d1d', text: '#ffffff' },
}

let measureContext: CanvasRenderingContext2D | null | undefined
function textWidth(text: string): number {
  if (measureContext === undefined) measureContext = document.createElement('canvas').getContext('2d')
  if (!measureContext) return text.length * 9
  measureContext.font = `600 ${FONT_SIZE}px ${FONT_FAMILY}`
  return measureContext.measureText(text).width
}

/** Where a line from `from` toward `to` leaves the box around a small feature. */
function edgeToward(from: Pt, to: Pt, box: Obstacle): Pt {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const tX = dx === 0 ? Infinity : ((dx > 0 ? box.x + box.halfW : box.x - box.halfW) - from[0]) / dx
  const tY = dy === 0 ? Infinity : ((dy > 0 ? box.y + box.halfH : box.y - box.halfH) - from[1]) / dy
  const t = Math.min(1, Math.max(0, Math.min(tX, tY)))
  return [from[0] + t * dx, from[1] + t * dy]
}

/** The corner points of a diamond (a square standing on one corner) centered on (cx, cy). */
function diamondPoints(cx: number, cy: number, r: number): string {
  return `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`
}

/** The corner points of a five-pointed star centered on (cx, cy). */
function starPoints(cx: number, cy: number): string {
  return Array.from({ length: 10 }, (_, k) => {
    const r = k % 2 === 0 ? STAR_OUTER_RADIUS : STAR_INNER_RADIUS
    const angle = -Math.PI / 2 + (k * Math.PI) / 5
    return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`
  }).join(' ')
}

export function RegionMap({
  region,
  markedItems,
  markerText,
  markerStates = {},
  highlightId = null,
  onItemTap,
  tapShapes = false,
  doneIds = NO_IDS,
}: RegionMapProps) {
  const [boxRef, box] = useElementSize<HTMLDivElement>()
  const patternId = useId().replace(/[^a-zA-Z0-9_-]/g, '')

  // The map fills all the space it's given. The region is fitted inside with a small
  // margin, and any leftover space shows the surrounding area instead of an empty box.
  const width = box.width
  const height = box.height
  const ready = width > 50 && height > 50

  // ---- Zoom and pan ----
  const svgRef = useRef<SVGSVGElement>(null)
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const [view, setView] = useState<ZoomTransform>(zoomIdentity)
  // When a drag or pinch actually moves the map, the tap that ends it is ignored until this time.
  const ignoreTapsUntil = useRef(0)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    let startView = zoomIdentity
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, MAX_ZOOM]) // can't zoom out past the default fit
      .extent([[0, 0], [width, height]])
      .translateExtent([[0, 0], [width, height]]) // can't drag the map off screen
      .clickDistance(TAP_TOLERANCE)
      .on('start', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        startView = event.transform
      })
      .on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => setView(event.transform))
      .on('end', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        const t = event.transform
        const moved = Math.hypot(t.x - startView.x, t.y - startView.y) > TAP_TOLERANCE || Math.abs(t.k - startView.k) > 0.01
        if (moved && event.sourceEvent) ignoreTapsUntil.current = performance.now() + 400
      })
    const selection = select(svg)
    // Double-tap zoom is turned off so quick taps on markers always count as taps.
    selection.call(behavior).on('dblclick.zoom', null)
    // Start at the default fit (this also runs again whenever the map is resized, like when the iPad rotates).
    behavior.transform(selection, zoomIdentity)
    zoomRef.current = behavior
    return () => {
      selection.on('.zoom', null)
    }
  }, [ready, width, height])

  const zoomBy = (factor: number) => {
    if (svgRef.current && zoomRef.current) zoomRef.current.scaleBy(select(svgRef.current), factor)
  }
  const resetZoom = () => {
    if (svgRef.current && zoomRef.current) zoomRef.current.transform(select(svgRef.current), zoomIdentity)
  }

  // ---- Geography (drawn at the default fit; the zoom group scales it) ----
  const projection = useMemo(
    () => makeProjection(region.bbox, Math.max(width, 1), Math.max(height, 1), MAP_PADDING),
    [region, width, height],
  )

  // Every country that shows anywhere on the map, including the surrounding area.
  const nearbyCountries = useMemo(
    () => countriesNear(visibleBounds(projection, Math.max(width, 1), Math.max(height, 1))),
    [projection, width, height],
  )

  const land = useMemo(() => {
    const path = geoPath(projection)
    return nearbyCountries.map((c) => ({ name: c.properties.name, d: path(c) ?? '' }))
  }, [projection, nearbyCountries])

  // Province and territory outlines for this region's province items (drawn on top of their country).
  const provinceShapes = useMemo(() => {
    const path = geoPath(projection)
    return region.items.flatMap((item) => {
      const shape = item.geometry.kind === 'province' ? findShape(item.geometry) : undefined
      return shape ? [{ id: item.id, d: path(shape) ?? '' }] : []
    })
  }, [region, projection])

  // The outline of the selected country or province, drawn in blue.
  const highlightedShapePath = useMemo(() => {
    const item = region.items.find((i) => i.id === highlightId)
    const shape = item ? findShape(item.geometry) : undefined
    return shape ? (geoPath(projection)(shape) ?? '') : ''
  }, [region, highlightId, projection])

  // Which region item (if any) each country shape belongs to.
  const itemIdByCountry = useMemo(() => {
    const lookup = new Map<string, string>()
    for (const item of region.items) {
      if (item.geometry.kind === 'country') lookup.set(item.geometry.worldAtlasName, item.id)
    }
    return lookup
  }, [region])

  const { lines, areas, cities } = useMemo(
    () => ({
      lines: region.items.filter((i) => i.geometry.kind === 'line'),
      areas: region.items.filter((i) => i.geometry.kind === 'polygon'),
      cities: region.items.filter((i) => i.type === 'city'),
    }),
    [region],
  )

  const shapePoints = useMemo(() => {
    const points: Record<string, Pt[]> = {}
    for (const item of region.items) points[item.id] = itemScreenPoints(item, projection)
    return points
  }, [region, projection])

  // ---- Things that stay the same size: positions moved to match the zoom ----
  const cityDots = useMemo(
    () =>
      cities.flatMap((c) =>
        c.geometry.kind === 'point' ? [{ id: c.id, at: view.apply(project(projection, c.geometry.lonLat)) }] : [],
      ),
    [cities, projection, view],
  )

  // Diamond markers for countries and provinces too small to see (like Singapore or Prince Edward Island).
  const countryDots = useMemo(
    () =>
      region.items.flatMap((c) =>
        (c.geometry.kind === 'country' || c.geometry.kind === 'province') && c.geometry.dotLonLat
          ? [{ id: c.id, at: view.apply(project(projection, c.geometry.dotLonLat)) }]
          : [],
      ),
    [region, projection, view],
  )

  // Items drawn as a dot or diamond: their number starts beside it, and numbers keep off it.
  const dots = useMemo(
    () => [
      ...cityDots.map((d) => ({ ...d, r: CITY_DOT_RADIUS })),
      ...countryDots.map((d) => ({ ...d, r: COUNTRY_DOT_SIZE })),
    ],
    [cityDots, countryDots],
  )
  const hasDot = (id: string) => dots.some((d) => d.id === id)

  // Each river, canal, shape, and country's drawn size at the default fit, as a box
  // (top-left and bottom-right corners). Used to spot features small enough that
  // their own label would cover them.
  const featureBoxes = useMemo(() => {
    const boxes: Record<string, [Pt, Pt]> = {}
    const path = geoPath(projection)
    for (const item of region.items) {
      const g = item.geometry
      if (g.kind === 'line' || g.kind === 'polygon') {
        const points = shapePoints[item.id]
        if (points.length === 0) continue
        const xs = points.map((p) => p[0])
        const ys = points.map((p) => p[1])
        boxes[item.id] = [
          [Math.min(...xs), Math.min(...ys)],
          [Math.max(...xs), Math.max(...ys)],
        ]
      } else if ((g.kind === 'country' || g.kind === 'province') && !g.dotLonLat) {
        const shape = findShape(g)
        if (shape) boxes[item.id] = path.bounds(shape) as [Pt, Pt]
      }
    }
    return boxes
  }, [region, projection, shapePoints])

  // Each marker's natural spot at the default fit (worked out once, not on every zoom step).
  const baseAnchors = useMemo(() => {
    const anchors: Record<string, Pt> = {}
    for (const item of markedItems) {
      const anchor = markerAnchor(item, projection, region.bbox)
      if (anchor) anchors[item.id] = anchor
    }
    return anchors
  }, [markedItems, projection, region])

  // Work out each marker's size and final position for the current zoom.
  const markers = useMemo(() => {
    const onScreen = ([x, y]: Pt) => x >= 0 && x <= width && y >= 0 && y <= height
    const boxes: MarkerBox[] = []
    const anchors: Record<string, Pt> = {}
    // Features small enough that their own label would cover them (see below).
    const smallFeatures: Record<string, Obstacle> = {}
    for (const item of markedItems) {
      if (!baseAnchors[item.id]) continue
      const anchor = view.apply(baseAnchors[item.id])
      if (!onScreen(anchor)) continue // its spot is outside the zoomed-in view
      anchors[item.id] = anchor
      const text = markerText[item.id] ?? ''
      const round = text.length <= 3
      const halfW = round ? NUMBER_RADIUS : textWidth(text) / 2 + PILL_PAD_X
      const halfH = round ? NUMBER_RADIUS : PILL_HALF_H

      // Is the feature (at this zoom) small enough to hide under its own label?
      // Then treat it like a city dot: the label starts beside it and labels keep off it.
      const featureBox = featureBoxes[item.id]
      if (featureBox) {
        const [x0, y0] = view.apply(featureBox[0])
        const [x1, y1] = view.apply(featureBox[1])
        if (x1 - x0 <= halfW * 2 + 8 && y1 - y0 <= halfH * 2 + 8) {
          smallFeatures[item.id] = {
            x: (x0 + x1) / 2,
            y: (y0 + y1) / 2,
            halfW: (x1 - x0) / 2 + 3,
            halfH: (y1 - y0) / 2 + 3,
            round: false,
          }
        }
      }

      // Where the marker starts: beside its dot, beside its small feature, or on its spot.
      const small = smallFeatures[item.id]
      let startX = anchor[0]
      if (hasDot(item.id) && !item.markerLonLat) startX = anchor[0] + halfW + 6
      else if (small) startX = small.x + small.halfW + halfW + 4
      boxes.push({ id: item.id, x: startX, y: anchor[1], halfW, halfH, round })
    }
    const obstacles: Obstacle[] = [
      ...dots
        .filter((d) => onScreen(d.at))
        .map((d) => ({ x: d.at[0], y: d.at[1], halfW: d.r + 3, halfH: d.r + 3, round: true })),
      ...Object.values(smallFeatures),
    ]
    const positions = spreadMarkers(boxes, obstacles, width, height)
    return boxes.map((b) => {
      const anchor = anchors[b.id]
      const [x, y] = positions[b.id]
      // Draw a pointer line if the marker ended up away from its spot.
      const needsLeader = Math.abs(anchor[0] - x) > b.halfW || Math.abs(anchor[1] - y) > b.halfH
      // For a small feature, the line starts at the feature's edge so it doesn't cover it.
      const small = smallFeatures[b.id]
      const leaderFrom = small ? edgeToward(anchor, [x, y], small) : anchor
      return { ...b, anchor, x, y, needsLeader, leaderFrom, isSmallFeature: !!small, text: markerText[b.id] ?? '' }
    })
  }, [markedItems, markerText, baseAnchors, dots, featureBoxes, view, width, height])

  // Ringed markers are drawn last, so their ring sits on top of their neighbors.
  const hasRing = (id: string) => Boolean(MARKER_COLORS[markerStates[id] ?? 'normal'].ring)
  const markersInDrawOrder = [...markers].sort((a, b) => Number(hasRing(a.id)) - Number(hasRing(b.id)))
  const tap = (id: string) => () => {
    if (performance.now() < ignoreTapsUntil.current) return // this "tap" was the end of a drag or pinch
    onItemTap?.(id)
  }
  const shapeTap = (id: string | undefined) => (tapShapes && id ? tap(id) : undefined)
  // Keeps the hatching the same size while the shapes it fills are zoomed.
  const unzoomPattern = `scale(${1 / view.k})`

  return (
    <div ref={boxRef} className="map-fit">
      {ready && (
        <div className="map-frame">
          <svg
            ref={svgRef}
            className="map"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            fontFamily={FONT_FAMILY}
            fontSize={FONT_SIZE}
            fontWeight={600}
          >
            <defs>
              <pattern
                id={`${patternId}-mountains`}
                patternUnits="userSpaceOnUse"
                width="7"
                height="7"
                patternTransform={`${unzoomPattern} rotate(45)`}
              >
                <rect width="7" height="7" fill="rgba(146, 98, 57, 0.16)" />
                <line x1="0" y1="0" x2="0" y2="7" stroke="rgba(146, 98, 57, 0.75)" strokeWidth="1.6" />
              </pattern>
              <pattern
                id={`${patternId}-desert`}
                patternUnits="userSpaceOnUse"
                width="8"
                height="8"
                patternTransform={unzoomPattern}
              >
                <rect width="8" height="8" fill="rgba(222, 184, 105, 0.35)" />
                <circle cx="2" cy="2" r="1.1" fill="rgba(170, 125, 40, 0.85)" />
                <circle cx="6" cy="6" r="1.1" fill="rgba(170, 125, 40, 0.85)" />
              </pattern>
              <pattern
                id={`${patternId}-plateau`}
                patternUnits="userSpaceOnUse"
                width="8"
                height="8"
                patternTransform={`${unzoomPattern} rotate(-45)`}
              >
                <rect width="8" height="8" fill="rgba(124, 92, 170, 0.14)" />
                <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(124, 92, 170, 0.6)" strokeWidth="1.4" />
              </pattern>
            </defs>

            {/* Water */}
            <rect width={width} height={height} fill={COLORS.water} />

            {/* The zoomable geography. "non-scaling-stroke" keeps lines the same thickness at any zoom. */}
            <g transform={view.toString()}>
              {/* Land */}
              {land.map((c) => {
                const itemId = itemIdByCountry.get(c.name)
                return (
                  <path
                    key={c.name}
                    d={c.d}
                    fill={itemId && doneIds.has(itemId) ? COLORS.doneCountry : COLORS.land}
                    stroke={COLORS.border}
                    strokeWidth={1.5}
                    vectorEffect="non-scaling-stroke"
                    onClick={shapeTap(itemId)}
                    className={tapShapes && itemId ? 'tappable' : undefined}
                  />
                )
              })}

              {/* Provinces and territories (drawn like land, on top of their country) */}
              {provinceShapes.map((p) => (
                <path
                  key={p.id}
                  d={p.d}
                  fill={doneIds.has(p.id) ? COLORS.doneCountry : COLORS.land}
                  stroke={COLORS.border}
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                  onClick={shapeTap(p.id)}
                  className={tapShapes ? 'tappable' : undefined}
                />
              ))}

              {/* Highlighted country or province */}
              {highlightedShapePath && (
                <path
                  d={highlightedShapePath}
                  fill={COLORS.highlightFill}
                  stroke={COLORS.highlight}
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                  pointerEvents="none"
                />
              )}

              {/* Mountains, deserts, plateaus (hatched), lakes and reefs (solid colors) */}
              {areas.map((item) => (
                <path
                  key={item.id}
                  d={toSvgPath(shapePoints[item.id], true)}
                  fill={SOLID_AREAS[item.type]?.fill ?? `url(#${patternId}-${item.type})`}
                  stroke={
                    item.id === highlightId ? COLORS.highlight : (SOLID_AREAS[item.type]?.edge ?? 'rgba(90, 70, 50, 0.45)')
                  }
                  strokeWidth={item.id === highlightId ? 3 : 1}
                  vectorEffect="non-scaling-stroke"
                  opacity={doneIds.has(item.id) ? DONE_AREA_OPACITY : undefined}
                  onClick={shapeTap(item.id)}
                  className={tapShapes ? 'tappable' : undefined}
                  pointerEvents={tapShapes ? undefined : 'none'}
                />
              ))}

              {/* Rivers and canals */}
              {lines.map((item) => {
                const d = toSvgPath(shapePoints[item.id], false)
                const isHighlighted = item.id === highlightId
                const isDone = doneIds.has(item.id)
                const look = item.type === 'canal' ? LINE_LOOKS.canal : LINE_LOOKS.river
                return (
                  <g key={item.id}>
                    <path
                      d={d}
                      fill="none"
                      stroke={isHighlighted ? look.selectedColor : isDone ? COLORS.doneRiver : look.color}
                      strokeWidth={isHighlighted ? look.selectedWidth : isDone ? DONE_LINE_WIDTH : look.width}
                      vectorEffect="non-scaling-stroke"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      pointerEvents="none"
                    />
                    {tapShapes && (
                      // A wide invisible line so the thin river is easy to tap.
                      <path
                        d={d}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={20}
                        vectorEffect="non-scaling-stroke"
                        onClick={tap(item.id)}
                        className="tappable"
                      />
                    )}
                  </g>
                )
              })}
            </g>

            {/* City dots (a selected city shows a yellow star instead) */}
            {cityDots.map((dot) =>
              dot.id === highlightId ? (
                <polygon
                  key={dot.id}
                  points={starPoints(dot.at[0], dot.at[1])}
                  fill={COLORS.cityStar}
                  stroke={COLORS.cityStarOutline}
                  strokeWidth={1}
                  strokeLinejoin="round"
                />
              ) : (
                <circle
                  key={dot.id}
                  cx={dot.at[0]}
                  cy={dot.at[1]}
                  r={CITY_DOT_RADIUS}
                  fill={doneIds.has(dot.id) ? COLORS.doneCity : COLORS.cityDot}
                  stroke="#fff"
                  strokeWidth={1.5}
                />
              ),
            )}

            {/* Diamonds for countries too small to see (colored like a country: gray, blue when selected, green when solved) */}
            {countryDots.map((dot) => {
              const isSelected = dot.id === highlightId
              const isDone = doneIds.has(dot.id)
              return (
                <polygon
                  key={dot.id}
                  points={diamondPoints(dot.at[0], dot.at[1], isSelected ? COUNTRY_DOT_SIZE_SELECTED : COUNTRY_DOT_SIZE)}
                  fill={isSelected ? COLORS.highlightFill : isDone ? COLORS.doneCountry : COLORS.land}
                  stroke={isSelected ? COLORS.highlight : isDone ? COLORS.doneRiver : COLORS.countryDotOutline}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  onClick={shapeTap(dot.id)}
                  className={tapShapes ? 'tappable' : undefined}
                  pointerEvents={tapShapes ? undefined : 'none'}
                />
              )
            })}

            {/* Pointer lines from moved markers back to their spots */}
            {markers
              .filter((m) => m.needsLeader)
              .map((m) => (
                <g key={`leader-${m.id}`} pointerEvents="none">
                  <line x1={m.leaderFrom[0]} y1={m.leaderFrom[1]} x2={m.x} y2={m.y} stroke={COLORS.leader} strokeWidth={1.5} />
                  {/* A small end dot, except where a city dot or diamond marks the spot, or it would cover a small feature */}
                  {!hasDot(m.id) && !m.isSmallFeature && <circle cx={m.anchor[0]} cy={m.anchor[1]} r={3} fill={COLORS.leader} />}
                </g>
              ))}

            {/* Markers */}
            {markersInDrawOrder.map((m) => {
              const colors = MARKER_COLORS[markerStates[m.id] ?? 'normal']
              return (
                <g key={m.id} transform={`translate(${m.x},${m.y})`} onClick={tap(m.id)} className="marker">
                  {m.round ? (
                    <>
                      <circle r={NUMBER_RADIUS + 5} fill="transparent" />
                      {colors.ring && <circle r={NUMBER_RADIUS + 4} fill="none" stroke={colors.ring} strokeWidth={4} />}
                      <circle r={NUMBER_RADIUS} fill={colors.fill} stroke={colors.stroke} strokeWidth={2} />
                    </>
                  ) : (
                    <>
                      <rect
                        x={-m.halfW - 3}
                        y={-m.halfH - 5}
                        width={m.halfW * 2 + 6}
                        height={m.halfH * 2 + 10}
                        fill="transparent"
                      />
                      {colors.ring && (
                        <rect
                          x={-m.halfW - 4}
                          y={-m.halfH - 4}
                          width={m.halfW * 2 + 8}
                          height={m.halfH * 2 + 8}
                          rx={m.halfH + 4}
                          fill="none"
                          stroke={colors.ring}
                          strokeWidth={4}
                        />
                      )}
                      <rect
                        x={-m.halfW}
                        y={-m.halfH}
                        width={m.halfW * 2}
                        height={m.halfH * 2}
                        rx={m.halfH}
                        fill={colors.fill}
                        stroke={colors.stroke}
                        strokeWidth={1.5}
                      />
                    </>
                  )}
                  <text textAnchor="middle" dominantBaseline="central" fill={colors.text}>
                    {m.text}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Zoom buttons */}
          <div className="zoom-controls">
            <button className="zoom-button" aria-label="Zoom in" onClick={() => zoomBy(ZOOM_STEP)} disabled={view.k >= MAX_ZOOM - 0.01}>
              +
            </button>
            <button className="zoom-button" aria-label="Zoom out" onClick={() => zoomBy(1 / ZOOM_STEP)} disabled={view.k <= 1.01}>
              −
            </button>
            <button className="zoom-button zoom-reset" aria-label="Reset zoom" onClick={resetZoom} disabled={view.k <= 1.01}>
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
