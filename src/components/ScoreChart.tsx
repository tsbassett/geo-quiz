// A small line chart of test percentages for one region, oldest on the left.
// Tap (or hover over) a dot to see that test's date and score above the chart.

import { useState } from 'react'
import { useElementSize } from '../hooks/useElementSize'
import { formatDay, formatWhen, type TestRecord } from '../lib/progress'

const HEIGHT = 170
const PAD = { top: 14, right: 52, bottom: 30, left: 48 }
const LINE_COLOR = '#2563eb'
const GRID_COLOR = '#e5e7eb'
const LABEL_COLOR = '#6b7280'
const INK = '#1f2937'
// Gridlines at the mastery cutoffs (60% yellow, 90% green) plus the top and bottom.
const GRIDLINES = [0, 60, 90, 100]
const LABELED = [0, 60, 90]

export function ScoreChart({ records }: { records: TestRecord[] }) {
  const [boxRef, box] = useElementSize<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)

  const width = box.width
  const plotWidth = width - PAD.left - PAD.right
  const plotHeight = HEIGHT - PAD.top - PAD.bottom
  const last = records.length - 1
  const x = (i: number) => PAD.left + (last === 0 ? plotWidth / 2 : (i / last) * plotWidth)
  const y = (percent: number) => PAD.top + (1 - percent / 100) * plotHeight
  const points = records.map((r, i) => [x(i), y(r.percent)] as const)
  const shown = records[active ?? last]
  const columnWidth = last === 0 ? plotWidth : plotWidth / last

  return (
    <div className="score-chart">
      <div className="chart-readout">
        {active === null ? 'Latest: ' : ''}
        {formatWhen(shown.date)} · <strong>{shown.percent}%</strong> ({shown.score} of {shown.total})
      </div>
      <div ref={boxRef} className="chart-box">
        {width > 150 && (
          <svg
            width={width}
            height={HEIGHT}
            role="img"
            aria-label={`Test scores over time, from ${records[0].percent}% to ${records[last].percent}%`}
            onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(null)}
          >
            {GRIDLINES.map((g) => (
              <line key={g} x1={PAD.left} x2={width - PAD.right} y1={y(g)} y2={y(g)} stroke={GRID_COLOR} strokeWidth={1} />
            ))}
            {LABELED.map((g) => (
              <text key={g} x={PAD.left - 8} y={y(g)} textAnchor="end" dominantBaseline="central" fontSize={16} fill={LABEL_COLOR}>
                {g}%
              </text>
            ))}

            {/* Dates of the first and latest tests */}
            <text x={x(0)} y={HEIGHT - 6} textAnchor={last === 0 ? 'middle' : 'start'} fontSize={16} fill={LABEL_COLOR}>
              {formatDay(records[0].date)}
            </text>
            {last > 0 && (
              <text x={x(last)} y={HEIGHT - 6} textAnchor="end" fontSize={16} fill={LABEL_COLOR}>
                {formatDay(records[last].date)}
              </text>
            )}

            {/* Crosshair on the tapped test */}
            {active !== null && (
              <line x1={points[active][0]} x2={points[active][0]} y1={PAD.top} y2={PAD.top + plotHeight} stroke="#9ca3af" strokeWidth={1} />
            )}

            <polyline
              points={points.map(([px, py]) => `${px},${py}`).join(' ')}
              fill="none"
              stroke={LINE_COLOR}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {points.map(([px, py], i) => (
              <circle key={i} cx={px} cy={py} r={i === (active ?? last) ? 6 : 4} fill={LINE_COLOR} stroke="#fff" strokeWidth={2} />
            ))}

            {/* The latest score, labeled at the end of the line */}
            <text x={points[last][0] + 12} y={points[last][1]} dominantBaseline="central" fontSize={16} fontWeight={700} fill={INK}>
              {records[last].percent}%
            </text>

            {/* Wide invisible strips so each test is easy to tap */}
            {points.map(([px], i) => (
              <rect
                key={`hit-${i}`}
                x={px - columnWidth / 2}
                y={PAD.top}
                width={columnWidth}
                height={plotHeight}
                fill="transparent"
                onClick={() => setActive(i)}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}
              />
            ))}
          </svg>
        )}
      </div>
    </div>
  )
}
