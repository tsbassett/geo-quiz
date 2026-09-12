// One region, with Study / Practice / Test tabs across the top.

import { useState, type CSSProperties } from 'react'
import type { Item, Region } from '../data/types'
import { regionAspect } from '../map/geometry'
import { PracticeMode } from './PracticeMode'
import { StudyMode } from './StudyMode'
import { TestMode } from './TestMode'

type Mode = 'study' | 'practice' | 'test'

const MODES: { id: Mode; label: string }[] = [
  { id: 'study', label: 'Study' },
  { id: 'practice', label: 'Practice' },
  { id: 'test', label: 'Test' },
]

export function RegionScreen({ region }: { region: Region }) {
  const [mode, setMode] = useState<Mode>('study')
  // When set, Practice uses only these items (from "Review missed" after a test).
  const [review, setReview] = useState<{ items: Item[]; round: number } | null>(null)

  const reviewMissed = (items: Item[]) => {
    setReview((old) => ({ items, round: (old?.round ?? 0) + 1 }))
    setMode('practice')
  }

  // Tells the page layout the map's shape, so in portrait the map gets just the height it needs.
  const style = { '--map-aspect': regionAspect(region.bbox) } as CSSProperties

  if (region.items.length === 0) {
    return (
      <div className="screen">
        <header className="top-bar">
          <a className="home-link" href="#/">
            ← Home
          </a>
          <h1>{region.name}</h1>
        </header>
        <div className="placeholder">This region is coming soon.</div>
      </div>
    )
  }

  return (
    <div className="screen" style={style}>
      <header className="top-bar">
        <a className="home-link" href="#/">
          ← Home
        </a>
        <h1>{region.name}</h1>
        <nav className="tabs">
          {MODES.map((m) => (
            <button key={m.id} className={`tab ${mode === m.id ? 'tab-active' : ''}`} onClick={() => setMode(m.id)}>
              {m.label}
            </button>
          ))}
        </nav>
      </header>

      {/* All modes stay loaded (just hidden), so switching tabs doesn't lose your place. */}
      <div className="mode-slot" hidden={mode !== 'study'}>
        <StudyMode region={region} />
      </div>
      <div className="mode-slot" hidden={mode !== 'practice'}>
        <PracticeMode
          // A new key starts a fresh practice round whenever the item list changes.
          key={review ? `review-${review.round}` : 'all'}
          region={region}
          items={review?.items ?? region.items}
          onPracticeAll={review ? () => setReview(null) : undefined}
        />
      </div>
      <div className="mode-slot" hidden={mode !== 'test'}>
        <TestMode region={region} onReviewMissed={reviewMissed} />
      </div>
    </div>
  )
}
