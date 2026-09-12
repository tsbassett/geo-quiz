// Draws one region's map: land, shaded areas, rivers, city dots, and markers.
// It works for any region, driven entirely by the region's data file.

import { useId, useMemo } from 'react'
import { geoPath } from 'd3-geo'
import type { Item, Region } from '../data/types'
import { useElementSize } from '../hooks/useElementSize'
import { itemScreenPoints, makeProjection, markerAnchor, project, regionAspect, toSvgPath, type Pt } from './geometry'
import { spreadMarkers, type MarkerBox, type Obstacle } from './layout'
import { countriesNear } from './world'

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

const COLORS = {
  water: '#f3f7fb',
  land: '#d6d6d6',
  border: '#6b7280',
  river: '#1e40af',
  riverSelected: '#3b82f6',
  cityDot: '#111827',
  cityStar: '#facc15',
  cityStarOutline: '#854d0e',
  leader: '#374151',
  highlight: '#2563eb',
  highlightFill: '#bfdbfe',
  // Faded look for solved items
  doneCountry: '#d3e6cc',
  doneRiver: '#a9bfa6',
  doneCity: '#c7c7c7',
}
const DONE_AREA_OPACITY = 0.35 // solved deserts, mountains, and plateaus fade to this

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

  // Make the map as big as fits in the space, keeping its shape.
  const aspect = regionAspect(region.bbox)
  const width = Math.floor(Math.min(box.width, box.height * aspect))
  const height = Math.floor(width / aspect)
  const ready = width > 50 && height > 50

  const projection = useMemo(
    () => makeProjection(region.bbox, Math.max(width, 1), Math.max(height, 1)),
    [region, width, height],
  )

  const nearbyCountries = useMemo(() => countriesNear(region.bbox), [region])

  const land = useMemo(() => {
    const path = geoPath(projection)
    return nearbyCountries.map((c) => ({ name: c.properties.name, d: path(c) ?? '' }))
  }, [projection, nearbyCountries])

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

  const cityDots = useMemo(
    () =>
      cities.flatMap((c) =>
        c.geometry.kind === 'point' ? [{ id: c.id, at: project(projection, c.geometry.lonLat) }] : [],
      ),
    [cities, projection],
  )

  // Work out each marker's size and final position.
  const markers = useMemo(() => {
    const boxes: MarkerBox[] = []
    const anchors: Record<string, Pt> = {}
    for (const item of markedItems) {
      const anchor = markerAnchor(item, projection)
      if (!anchor) continue
      anchors[item.id] = anchor
      const text = markerText[item.id] ?? ''
      const round = text.length <= 3
      const halfW = round ? NUMBER_RADIUS : textWidth(text) / 2 + PILL_PAD_X
      const halfH = round ? NUMBER_RADIUS : PILL_HALF_H
      // A city's marker starts just to the right of its dot; everything else starts on its spot.
      const startX = item.type === 'city' && !item.markerLonLat ? anchor[0] + halfW + 6 : anchor[0]
      boxes.push({ id: item.id, x: startX, y: anchor[1], halfW, halfH, round })
    }
    const obstacles: Obstacle[] = cityDots.map((d) => ({ x: d.at[0], y: d.at[1], r: CITY_DOT_RADIUS + 3 }))
    const positions = spreadMarkers(boxes, obstacles, width, height)
    return boxes.map((b) => {
      const anchor = anchors[b.id]
      const [x, y] = positions[b.id]
      // Draw a pointer line if the marker ended up away from its spot.
      const needsLeader = Math.abs(anchor[0] - x) > b.halfW || Math.abs(anchor[1] - y) > b.halfH
      return { ...b, anchor, x, y, needsLeader, text: markerText[b.id] ?? '' }
    })
  }, [markedItems, markerText, projection, cityDots, width, height])

  // Ringed markers are drawn last, so their ring sits on top of their neighbors.
  const hasRing = (id: string) => Boolean(MARKER_COLORS[markerStates[id] ?? 'normal'].ring)
  const markersInDrawOrder = [...markers].sort((a, b) => Number(hasRing(a.id)) - Number(hasRing(b.id)))
  const highlighted = region.items.find((i) => i.id === highlightId)
  const tap = (id: string) => () => onItemTap?.(id)
  const shapeTap = (id: string | undefined) => (tapShapes && id ? tap(id) : undefined)

  return (
    <div ref={boxRef} className="map-fit">
      {ready && (
        <svg
          className="map"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          fontFamily={FONT_FAMILY}
          fontSize={FONT_SIZE}
          fontWeight={600}
        >
          <defs>
            <pattern id={`${patternId}-mountains`} patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)">
              <rect width="7" height="7" fill="rgba(146, 98, 57, 0.16)" />
              <line x1="0" y1="0" x2="0" y2="7" stroke="rgba(146, 98, 57, 0.75)" strokeWidth="1.6" />
            </pattern>
            <pattern id={`${patternId}-desert`} patternUnits="userSpaceOnUse" width="8" height="8">
              <rect width="8" height="8" fill="rgba(222, 184, 105, 0.35)" />
              <circle cx="2" cy="2" r="1.1" fill="rgba(170, 125, 40, 0.85)" />
              <circle cx="6" cy="6" r="1.1" fill="rgba(170, 125, 40, 0.85)" />
            </pattern>
            <pattern id={`${patternId}-plateau`} patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(-45)">
              <rect width="8" height="8" fill="rgba(124, 92, 170, 0.14)" />
              <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(124, 92, 170, 0.6)" strokeWidth="1.4" />
            </pattern>
          </defs>

          {/* Water */}
          <rect width={width} height={height} fill={COLORS.water} />

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
                onClick={shapeTap(itemId)}
                className={tapShapes && itemId ? 'tappable' : undefined}
              />
            )
          })}

          {/* Highlighted country */}
          {highlighted?.geometry.kind === 'country' &&
            land
              .filter((c) => highlighted.geometry.kind === 'country' && c.name === highlighted.geometry.worldAtlasName)
              .map((c) => (
                <path key="highlight" d={c.d} fill={COLORS.highlightFill} stroke={COLORS.highlight} strokeWidth={1.5} pointerEvents="none" />
              ))}

          {/* Mountains, deserts, plateaus */}
          {areas.map((item) => (
            <path
              key={item.id}
              d={toSvgPath(shapePoints[item.id], true)}
              fill={`url(#${patternId}-${item.type})`}
              stroke={item.id === highlightId ? COLORS.highlight : 'rgba(90, 70, 50, 0.45)'}
              strokeWidth={item.id === highlightId ? 3 : 1}
              opacity={doneIds.has(item.id) ? DONE_AREA_OPACITY : undefined}
              onClick={shapeTap(item.id)}
              className={tapShapes ? 'tappable' : undefined}
              pointerEvents={tapShapes ? undefined : 'none'}
            />
          ))}

          {/* Rivers */}
          {lines.map((item) => {
            const d = toSvgPath(shapePoints[item.id], false)
            const isHighlighted = item.id === highlightId
            const isDone = doneIds.has(item.id)
            return (
              <g key={item.id}>
                <path
                  d={d}
                  fill="none"
                  stroke={isHighlighted ? COLORS.riverSelected : isDone ? COLORS.doneRiver : COLORS.river}
                  strokeWidth={isHighlighted ? 4 : isDone ? 1.5 : 2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pointerEvents="none"
                />
                {tapShapes && (
                  // A wide invisible line so the thin river is easy to tap.
                  <path d={d} fill="none" stroke="transparent" strokeWidth={20} onClick={tap(item.id)} className="tappable" />
                )}
              </g>
            )
          })}

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

          {/* Pointer lines from moved markers back to their spots */}
          {markers
            .filter((m) => m.needsLeader)
            .map((m) => {
              const isCity = region.items.find((i) => i.id === m.id)?.type === 'city'
              return (
                <g key={`leader-${m.id}`} pointerEvents="none">
                  <line x1={m.anchor[0]} y1={m.anchor[1]} x2={m.x} y2={m.y} stroke={COLORS.leader} strokeWidth={1.5} />
                  {!isCity && <circle cx={m.anchor[0]} cy={m.anchor[1]} r={3} fill={COLORS.leader} />}
                </g>
              )
            })}

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
                    <rect x={-m.halfW - 3} y={-m.halfH - 5} width={m.halfW * 2 + 6} height={m.halfH * 2 + 10} fill="transparent" />
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
      )}
    </div>
  )
}
