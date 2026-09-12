// Home: pick a region or the Full Test, and see progress and trouble spots.

import { useState } from 'react'
import { regions } from '../data/regions'
import { TYPE_NAMES } from '../data/types'
import { ScoreChart } from '../components/ScoreChart'
import {
  FULL_TEST,
  METHOD_NAMES,
  formatWhen,
  loadProgress,
  masteryOf,
  resetProgress,
  troubleSpots,
  type TestRecord,
} from '../lib/progress'

const ATTEMPTS_SHOWN = 5 // attempts listed per region before "Show all"

export function HomeScreen() {
  const [progress, setProgress] = useState(loadProgress)
  const [confirmingReset, setConfirmingReset] = useState(false)

  // Test history grouped by region (in Home screen order), with the Full Test last.
  const groups = [
    ...regions.map((r) => ({ key: r.slug, title: r.name })),
    { key: FULL_TEST, title: 'Full Test' },
  ]
    .map((group) => ({ ...group, records: progress.history.filter((h) => h.region === group.key) }))
    .filter((group) => group.records.length > 0)

  const spots = troubleSpots(progress.history).flatMap((spot) => {
    const [slug, id] = spot.key.split(':')
    const region = regions.find((r) => r.slug === slug)
    const item = region?.items.find((i) => i.id === id)
    return region && item ? [{ ...spot, region, item }] : [] // skip items no longer in the data
  })

  const reset = () => {
    resetProgress()
    setProgress(loadProgress())
    setConfirmingReset(false)
  }

  return (
    <div className="home">
      <header className="home-header">
        <h1>🌏 Geo Quiz</h1>
        <p>Pick a region to study, practice, or take a test.</p>
      </header>

      <div className="region-grid">
        {regions.map((region) => {
          const best = progress.best[region.slug]
          if (region.items.length === 0) {
            return (
              <div key={region.slug} className="region-button region-soon">
                <span className="region-name">{region.name}</span>
                <span className="region-status">Coming soon</span>
              </div>
            )
          }
          return (
            <a key={region.slug} href={`#/region/${region.slug}`} className={`region-button mastery-${masteryOf(best)}`}>
              <span className="region-name">{region.name}</span>
              <span className="region-status">{best === undefined ? 'Not started' : `Best test: ${best}%`}</span>
            </a>
          )
        })}
      </div>

      <a href="#/full-test" className="full-test-button">
        Full Test (all regions)
      </a>

      <div className="mastery-key">
        <span>
          <i className="key-dot mastery-none" /> Not started
        </span>
        <span>
          <i className="key-dot mastery-low" /> Under 60%
        </span>
        <span>
          <i className="key-dot mastery-mid" /> 60 to 89%
        </span>
        <span>
          <i className="key-dot mastery-high" /> 90% and up
        </span>
      </div>

      <section className="home-section">
        <h2>Progress</h2>
        {groups.length === 0 ? (
          <p className="hint">No tests yet. Every finished test will show up here.</p>
        ) : (
          <div className="progress-grid">
            {groups.map((group) => (
              <ProgressCard key={group.key} title={group.title} records={group.records} />
            ))}
          </div>
        )}
      </section>

      <section className="home-section">
        <h2>Trouble spots</h2>
        {spots.length === 0 ? (
          <p className="hint">Nothing missed yet. Items missed on tests will be listed here, most-missed first.</p>
        ) : (
          <ol className="trouble-list">
            {spots.map((spot) => (
              <li key={spot.key} className="trouble-row">
                <span className="trouble-name">{spot.item.label}</span>
                <span className="trouble-detail">
                  {TYPE_NAMES[spot.item.type]} · {spot.region.name}
                </span>
                <span className="trouble-count">
                  Missed {spot.missed} of {spot.tested} {spot.tested === 1 ? 'test' : 'tests'}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <footer className="home-footer">
        {confirmingReset ? (
          <div className="reset-confirm" role="alert">
            <p>Erase all best scores and the whole test history? This can't be undone.</p>
            <button className="danger-button" onClick={reset}>
              Yes, erase everything
            </button>
            <button className="small-button" onClick={() => setConfirmingReset(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="link-button" onClick={() => setConfirmingReset(true)}>
            Reset progress
          </button>
        )}
      </footer>
    </div>
  )
}

/** One region's test history: a chart of percentages and a list of attempts, newest first. */
function ProgressCard({ title, records }: { title: string; records: TestRecord[] }) {
  const [showAll, setShowAll] = useState(false)
  const newestFirst = [...records].reverse()
  const shown = showAll ? newestFirst : newestFirst.slice(0, ATTEMPTS_SHOWN)

  return (
    <div className="progress-card">
      <h3>
        {title} <span className="muted">· {records.length} {records.length === 1 ? 'test' : 'tests'}</span>
      </h3>
      {records.length >= 2 && <ScoreChart records={records} />}
      <ul className="attempt-list">
        {shown.map((r) => (
          <li key={r.date} className="attempt-row">
            <span className="attempt-when">{formatWhen(r.date)}</span>
            <span className="attempt-method">{METHOD_NAMES[r.method]}</span>
            <span className="attempt-score">
              {r.score}/{r.total}
            </span>
            <span className="attempt-percent">{r.percent}%</span>
          </li>
        ))}
      </ul>
      {records.length > ATTEMPTS_SHOWN && (
        <button className="small-button" onClick={() => setShowAll((s) => !s)}>
          {showAll ? 'Show fewer' : `Show all ${records.length}`}
        </button>
      )}
    </div>
  )
}
