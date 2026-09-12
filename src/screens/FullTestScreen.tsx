// Full Test: every region that has data, one after another in a single sitting.
// No scores are shown until the end, then one combined score plus each region's score.

import { useState, type CSSProperties } from 'react'
import { regions } from '../data/regions'
import type { Region } from '../data/types'
import { regionAspect } from '../map/geometry'
import {
  FULL_TEST,
  itemKey,
  loadProgress,
  percentOf,
  recordTest,
  saveMethod,
  type Method,
} from '../lib/progress'
import { TestSession, type TestResult } from './TestMode'

interface RegionResult extends TestResult {
  region: Region
}

const topBar = (
  <header className="top-bar">
    <a className="home-link" href="#/">
      ← Home
    </a>
    <h1>Full Test</h1>
  </header>
)

export function FullTestScreen() {
  const testRegions = regions.filter((r) => r.items.length > 0)
  const itemCount = testRegions.reduce((sum, r) => sum + r.items.length, 0)

  const [method, setMethod] = useState<Method>(() => loadProgress().method)
  // 'intro' = start page, a number = which region is being answered, 'done' = results.
  const [stage, setStage] = useState<'intro' | number | 'done'>('intro')
  const [results, setResults] = useState<RegionResult[]>([])
  const [newBests, setNewBests] = useState<string[]>([])

  const start = () => {
    saveMethod(method)
    setResults([])
    setNewBests([])
    setStage(0)
  }

  const finishRegion = (index: number, result: TestResult) => {
    const all = [...results, { ...result, region: testRegions[index] }]
    setResults(all)
    if (index + 1 < testRegions.length) {
      setStage(index + 1)
      return
    }
    // Last region: save one Full Test record, and update each region's best score.
    const score = all.reduce((sum, r) => sum + r.score, 0)
    const total = all.reduce((sum, r) => sum + r.total, 0)
    const breakdown = all.map((r) => ({ slug: r.region.slug, score: r.score, total: r.total }))
    const saved = recordTest(
      {
        region: FULL_TEST,
        method,
        score,
        total,
        tested: all.flatMap((r) => r.region.items.map((i) => itemKey(r.region.slug, i.id))),
        missed: all.flatMap((r) => r.missed.map((i) => itemKey(r.region.slug, i.id))),
        breakdown,
      },
      breakdown,
    )
    setNewBests(saved)
    setStage('done')
  }

  // ---- Answering one region ----
  if (typeof stage === 'number') {
    const region = testRegions[stage]
    const isLast = stage === testRegions.length - 1
    const style = { '--map-aspect': regionAspect(region.bbox) } as CSSProperties
    return (
      <div className="screen" style={style}>
        {topBar}
        <TestSession
          key={region.slug}
          region={region}
          items={region.items}
          method={method}
          heading={`${region.name} (${stage + 1} of ${testRegions.length})`}
          submitLabel={isLast ? 'Finish test' : 'Next region'}
          onSubmitted={(result) => finishRegion(stage, result)}
        />
      </div>
    )
  }

  // ---- Results ----
  if (stage === 'done') {
    const score = results.reduce((sum, r) => sum + r.score, 0)
    const total = results.reduce((sum, r) => sum + r.total, 0)
    return (
      <>
        {topBar}
        <main className="home">
          <div className="full-score">
            {score} of {total} correct ({percentOf(score, total)}%)
          </div>
          <table className="breakdown">
            <thead>
              <tr>
                <th>Region</th>
                <th>Score</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.region.slug}>
                  <td>
                    {r.region.name}
                    {newBests.includes(r.region.slug) && <span className="new-best">New best!</span>}
                    {r.missed.length > 0 && (
                      <div className="breakdown-missed">Missed: {r.missed.map((i) => i.label).join(', ')}</div>
                    )}
                  </td>
                  <td>
                    {r.score}/{r.total}
                  </td>
                  <td>{percentOf(r.score, r.total)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="button-row">
            <button className="big-button" onClick={() => setStage('intro')}>
              Take Full Test again
            </button>
            <a className="small-button link-as-button" href="#/">
              Back to Home
            </a>
          </div>
        </main>
      </>
    )
  }

  // ---- Start page ----
  return (
    <>
      {topBar}
      <main className="home">
        {testRegions.length === 0 ? (
          <p className="hint">No regions have data yet.</p>
        ) : (
          <>
            <p className="full-intro">
              {itemCount} items from {testRegions.length} {testRegions.length === 1 ? 'region' : 'regions'}, one region
              at a time: {testRegions.map((r) => r.name).join(', ')}. Your score is shown at the end.
            </p>
            <h3 className="section-label">How do you want to answer?</h3>
            <div className="method-toggle method-toggle-inline" role="group" aria-label="Answer method">
              {(['bank', 'type'] as const).map((m) => (
                <button key={m} className={`tab ${method === m ? 'tab-active' : ''}`} onClick={() => setMethod(m)}>
                  {m === 'bank' ? 'Word Bank' : 'Type It'}
                </button>
              ))}
            </div>
            <div className="button-row">
              <button className="big-button" onClick={start}>
                Start Full Test
              </button>
            </div>
          </>
        )}
      </main>
    </>
  )
}
