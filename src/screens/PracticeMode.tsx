// Practice mode: match each name in the word bank to its number on the map.
// Tap a name then a number, or a number then a name. Wrong names go back
// into the bank until every item has been matched correctly.

import { useEffect, useMemo, useState } from 'react'
import type { Item, Region } from '../data/types'
import { RegionMap, type MarkerState } from '../map/RegionMap'
import { alphabeticalIds, numberItems } from '../lib/quiz'

interface PracticeProps {
  region: Region
  /** The items to practice (all of the region, or just the ones missed on a test). */
  items: Item[]
  /** Only given when reviewing missed items: goes back to practicing everything. */
  onPracticeAll?: () => void
}

export function PracticeMode(props: PracticeProps) {
  // Changing the session number throws away the old round and starts a fresh one.
  const [session, setSession] = useState(0)
  return <PracticeSession key={session} {...props} onRestart={() => setSession((s) => s + 1)} />
}

type Feedback = { tone: 'good' | 'bad' | 'info'; text: string }

function PracticeSession({ region, items, onPracticeAll, onRestart }: PracticeProps & { onRestart: () => void }) {
  const [numbers] = useState(() => numberItems(region, items))
  // Names still waiting to be matched, in word-bank order (A to Z).
  const [bank, setBank] = useState(() => alphabeticalIds(items))
  const [correct, setCorrect] = useState<Set<string>>(() => new Set())
  const [pickedName, setPickedName] = useState<string | null>(null)
  const [pickedMarker, setPickedMarker] = useState<string | null>(null)
  const [wrongFlash, setWrongFlash] = useState<{ id: string } | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const itemsById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items])
  const label = (id: string) => itemsById.get(id)?.label ?? ''

  // A wrong marker glows red for a moment, then goes back to white.
  useEffect(() => {
    if (!wrongFlash) return
    const timer = setTimeout(() => setWrongFlash(null), 900)
    return () => clearTimeout(timer)
  }, [wrongFlash])

  const tryMatch = (nameId: string, markerId: string) => {
    setPickedName(null)
    setPickedMarker(null)
    if (nameId === markerId) {
      setCorrect((old) => new Set(old).add(markerId))
      setBank((old) => old.filter((id) => id !== nameId))
      setFeedback({ tone: 'good', text: `Correct! ${numbers[markerId]} is ${label(nameId)}.` })
    } else {
      setMistakes((m) => m + 1)
      setWrongFlash({ id: markerId })
      // The name stays in the word bank (in its A-to-Z place) to try again.
      setFeedback({ tone: 'bad', text: `Not quite. ${numbers[markerId]} is not ${label(nameId)}. Try again!` })
    }
  }

  const tapName = (id: string) => {
    if (pickedMarker) tryMatch(id, pickedMarker)
    else setPickedName((current) => (current === id ? null : id))
  }

  const tapMarker = (id: string) => {
    if (correct.has(id)) {
      // Already matched: just remind them what it is.
      setFeedback({ tone: 'info', text: `${numbers[id]} is ${label(id)}.` })
      return
    }
    if (pickedName) tryMatch(pickedName, id)
    else setPickedMarker((current) => (current === id ? null : id))
  }

  const markerStates: Record<string, MarkerState> = {}
  for (const id of correct) markerStates[id] = 'correct'
  if (wrongFlash && !correct.has(wrongFlash.id)) markerStates[wrongFlash.id] = 'incorrect'
  if (pickedMarker) markerStates[pickedMarker] = 'selected'

  const done = correct.size === items.length

  let hint = 'Tap a name, then tap its number on the map. (You can also tap a number first.)'
  if (pickedName) hint = `Now tap the number for ${label(pickedName)}.`
  if (pickedMarker) hint = `Now tap the name for number ${numbers[pickedMarker]}.`

  return (
    <div className="mode-column">
      <div className="status-bar">
        {onPracticeAll && <span className="review-tag">Missed items</span>}
        <div className="score">
          {correct.size} of {items.length} correct
        </div>
        <div className={`feedback feedback-${feedback?.tone ?? 'info'}`} aria-live="polite">
          {feedback?.text}
        </div>
        <button className="small-button" onClick={onRestart}>
          Start over
        </button>
        {onPracticeAll && (
          <button className="small-button" onClick={onPracticeAll}>
            Practice all
          </button>
        )}
      </div>

      <div className="mode-body">
        <div className="map-pane">
          <RegionMap
            region={region}
            markedItems={items}
            markerText={numbers}
            markerStates={markerStates}
            highlightId={pickedMarker}
            onItemTap={tapMarker}
            doneIds={correct}
          />
        </div>

        <aside className="side-pane">
          {done ? (
            <div className="done-card">
              <div className="done-title">🎉 You matched all {items.length}!</div>
              <div className="done-detail">
                {mistakes === 0 ? 'No mistakes. Amazing!' : `Mistakes along the way: ${mistakes}`}
              </div>
              <button className="big-button" onClick={onRestart}>
                Practice again
              </button>
            </div>
          ) : (
            <>
              <p className="hint">{hint}</p>
              <div className="chips">
                {bank.map((id) => (
                  <button
                    key={id}
                    className={`chip ${id === pickedName ? 'chip-selected' : ''}`}
                    onClick={() => tapName(id)}
                  >
                    {label(id)}
                  </button>
                ))}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
