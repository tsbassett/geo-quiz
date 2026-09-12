// Test mode: answer every number, then Submit to see the score.
// Two ways to answer: Word Bank (tap a name, then its number) or Type It.
// Nothing is marked right or wrong until Submit.

import { useMemo, useRef, useState, type ReactNode } from 'react'
import type { Item, Region } from '../data/types'
import { RegionMap, type MarkerState } from '../map/RegionMap'
import { isTypedAnswerCorrect, numberItems, shuffle } from '../lib/quiz'
import { itemKey, loadProgress, recordTest, saveMethod, type Method } from '../lib/progress'

interface TestModeProps {
  region: Region
  /** Opens Practice with just these items. */
  onReviewMissed: (items: Item[]) => void
}

export function TestMode({ region, onReviewMissed }: TestModeProps) {
  const [method, setMethod] = useState<Method>(() => loadProgress().method)
  // Changing the session number throws away the old test and starts a fresh one.
  const [session, setSession] = useState(0)
  const [newBest, setNewBest] = useState(false)

  const changeMethod = (m: Method) => {
    setMethod(m)
    saveMethod(m)
  }

  // Save the finished test to the history and update the best score.
  const saveResult = (result: TestResult) => {
    const newBests = recordTest(
      {
        region: region.slug,
        method,
        score: result.score,
        total: result.total,
        tested: region.items.map((i) => itemKey(region.slug, i.id)),
        missed: result.missed.map((i) => itemKey(region.slug, i.id)),
      },
      [{ slug: region.slug, score: result.score, total: result.total }],
    )
    setNewBest(newBests.length > 0)
  }

  return (
    <TestSession
      key={session}
      region={region}
      items={region.items}
      method={method}
      onMethodChange={changeMethod}
      onRestart={() => {
        setNewBest(false)
        setSession((s) => s + 1)
      }}
      onSubmitted={saveResult}
      onReviewMissed={onReviewMissed}
      resultNote={newBest ? 'New best score!' : undefined}
    />
  )
}

export interface TestResult {
  score: number
  total: number
  missed: Item[]
}

interface TestSessionProps {
  region: Region
  items: Item[]
  method: Method
  /** Leave out to hide the Word Bank / Type It switch (Full Test picks the method up front). */
  onMethodChange?: (method: Method) => void
  /** Shown at the start of the top bar, for example "East Asia (1 of 2)". */
  heading?: string
  /** The Submit button's text. */
  submitLabel?: string
  onSubmitted: (result: TestResult) => void
  /** Leave out to hide Start over. */
  onRestart?: () => void
  /** Leave out to hide Review missed. */
  onReviewMissed?: (items: Item[]) => void
  /** Extra message shown with the score, like "New best score!". */
  resultNote?: string
}

/** One test on one region: the numbered map plus Word Bank or Type It answers. */
export function TestSession({
  region,
  items,
  method,
  onMethodChange,
  heading,
  submitLabel = 'Submit',
  onSubmitted,
  onRestart,
  onReviewMissed,
  resultNote,
}: TestSessionProps) {
  const [numbers] = useState(() => numberItems(region, items))
  const [bankOrder] = useState(() => shuffle(items.map((i) => i.id)))
  const [placed, setPlaced] = useState<Record<string, string>>({}) // Word Bank: marker id -> chosen name id
  const [typed, setTyped] = useState<Record<string, string>>({}) // Type It: item id -> typed text
  const [pickedName, setPickedName] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirmingBlanks, setConfirmingBlanks] = useState(false)
  const [results, setResults] = useState<Record<string, boolean> | null>(null) // item id -> right or wrong
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const itemsById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items])
  const label = (id: string) => itemsById.get(id)?.label ?? ''
  const inNumberOrder = useMemo(() => [...items].sort((a, b) => +numbers[a.id] - +numbers[b.id]), [items, numbers])

  const isAnswered = (id: string) => (method === 'bank' ? placed[id] !== undefined : (typed[id] ?? '').trim() !== '')
  const answeredCount = items.filter((i) => isAnswered(i.id)).length
  const blanks = items.length - answeredCount

  /** What the student answered for an item, as text. */
  const yourAnswer = (id: string) => (method === 'bank' ? (placed[id] ? label(placed[id]) : '') : (typed[id] ?? '').trim())

  // ---- Word Bank ----
  /** The marker a name is currently placed on, if any. */
  const markerHolding = (nameId: string) => Object.keys(placed).find((markerId) => placed[markerId] === nameId)

  const placeName = (nameId: string, markerId: string) => {
    setPlaced((old) => {
      const next = { ...old }
      // If the name was on another number, take it off there (it's moving).
      for (const [otherMarker, otherName] of Object.entries(next)) {
        if (otherName === nameId) delete next[otherMarker]
      }
      // Any name already on the new number goes back to the word bank automatically.
      next[markerId] = nameId
      return next
    })
    setPickedName(null)
    setSelectedId(null)
    setConfirmingBlanks(false)
  }

  const removeAnswer = (markerId: string) => {
    setPlaced((old) => {
      const copy = { ...old }
      delete copy[markerId]
      return copy
    })
    setSelectedId(null)
    setConfirmingBlanks(false)
  }

  // Used by names in the word bank and names in "Your answers".
  const tapName = (nameId: string) => {
    if (selectedId) placeName(nameId, selectedId)
    else setPickedName((current) => (current === nameId ? null : nameId))
  }

  /** The prompt above the word bank, depending on what is picked or selected. */
  const bankHint = (): ReactNode => {
    if (pickedName) {
      const from = markerHolding(pickedName)
      return from
        ? `Moving ${label(pickedName)} (now on ${numbers[from]}). Tap its new number on the map, or tap ${label(pickedName)} again to cancel.`
        : `Now tap the number for ${label(pickedName)} on the map.`
    }
    if (selectedId) {
      const number = numbers[selectedId]
      const moveTip = answeredCount > 0 ? ' If the name is already used, tap it in Your answers to move it here.' : ''
      return placed[selectedId]
        ? `Number ${number} is set to ${label(placed[selectedId])}. To change it, tap another name in the word bank.${moveTip}`
        : `Now tap the name for number ${number} in the word bank.${moveTip}`
    }
    if (blanks === 0) {
      return `All names are placed. To move one, tap its name in Your answers, then tap the new number. Tap ${submitLabel} when you are ready.`
    }
    return (
      <ul className="hint-list">
        <li>Tap a number on the map, then tap its name.</li>
        <li>Or tap a name first, then tap its number.</li>
        {answeredCount > 0 && <li>To move an answer, tap its name in Your answers, then tap the new number.</li>}
        <li>Nothing is marked right or wrong until you tap {submitLabel}.</li>
      </ul>
    )
  }

  // ---- Map taps ----
  const tapMarker = (id: string) => {
    if (results) {
      // After grading: show that item's row in the results list.
      setSelectedId(id)
      rowRefs.current[id]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    } else if (method === 'type') {
      inputRefs.current[id]?.focus() // focusing the box also selects it
    } else if (pickedName) {
      placeName(pickedName, id)
    } else {
      setSelectedId((current) => (current === id ? null : id))
    }
  }

  // ---- Submit ----
  const submit = () => {
    if (blanks > 0 && !confirmingBlanks) {
      setConfirmingBlanks(true) // ask once before submitting with blanks
      return
    }
    const graded = Object.fromEntries(
      items.map((item) => [
        item.id,
        method === 'bank' ? placed[item.id] === item.id : isTypedAnswerCorrect(item, typed[item.id] ?? ''),
      ]),
    )
    setResults(graded)
    setSelectedId(null)
    setPickedName(null)
    setConfirmingBlanks(false)
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur() // closes the iPad keyboard
    const missedItems = items.filter((item) => !graded[item.id])
    onSubmitted({ score: items.length - missedItems.length, total: items.length, missed: missedItems })
  }

  // ---- Marker colors ----
  const markerStates: Record<string, MarkerState> = {}
  for (const item of items) {
    if (results) markerStates[item.id] = results[item.id] ? 'correct' : 'incorrect'
    else if (isAnswered(item.id)) markerStates[item.id] = method === 'bank' ? 'bankAnswered' : 'answered'
  }
  if (selectedId && !results) markerStates[selectedId] = method === 'bank' ? 'bankSelected' : 'selected'

  const correctCount = results ? items.filter((i) => results[i.id]).length : 0
  const missed = results ? items.filter((i) => !results[i.id]) : []
  const percent = items.length ? Math.round((correctCount / items.length) * 100) : 0

  return (
    <div className="mode-column">
      <div className="status-bar">
        {results ? (
          <>
            <div className="score">
              Score: {correctCount} of {items.length} ({percent}%)
            </div>
            <div className="feedback feedback-good">
              {[missed.length === 0 ? 'Perfect score! 🎉' : '', resultNote ?? ''].filter(Boolean).join(' ')}
            </div>
            {missed.length > 0 && onReviewMissed && (
              <button className="big-button" onClick={() => onReviewMissed(missed)}>
                Review missed ({missed.length})
              </button>
            )}
            {onRestart && (
              <button className="small-button" onClick={onRestart}>
                Take test again
              </button>
            )}
          </>
        ) : (
          <>
            {heading && <div className="score">{heading}</div>}
            {onMethodChange && (
              <div className="method-toggle" role="group" aria-label="Answer method">
                {(['bank', 'type'] as const).map((m) => (
                  <button
                    key={m}
                    className={`tab ${method === m ? 'tab-active' : ''}`}
                    disabled={method !== m && answeredCount > 0}
                    onClick={() => onMethodChange(m)}
                  >
                    {m === 'bank' ? 'Word Bank' : 'Type It'}
                  </button>
                ))}
              </div>
            )}
            <div className="score">
              {answeredCount} of {items.length} answered
            </div>
            <div className="feedback feedback-bad" aria-live="polite">
              {confirmingBlanks ? `${blanks} still blank. Tap ${submitLabel} again to finish anyway.` : ''}
            </div>
            {onRestart && (
              <button className="small-button" onClick={onRestart}>
                Start over
              </button>
            )}
            <button className="big-button" onClick={submit}>
              {submitLabel}
            </button>
          </>
        )}
      </div>

      <div className="mode-body">
        <div className="map-pane">
          <RegionMap
            region={region}
            markedItems={items}
            markerText={numbers}
            markerStates={markerStates}
            highlightId={selectedId}
            onItemTap={tapMarker}
          />
        </div>

        <aside className="side-pane">
          {results ? (
            // ---- Results list ----
            <>
              <p className="hint">Tap a row or a number to see it on the map.</p>
              <div className="result-list">
                {inNumberOrder.map((item) => {
                  const right = results[item.id]
                  return (
                    <button
                      key={item.id}
                      ref={(el) => {
                        rowRefs.current[item.id] = el
                      }}
                      className={`result-row ${right ? 'result-right' : 'result-wrong'} ${
                        selectedId === item.id ? 'result-selected' : ''
                      }`}
                      onClick={() => setSelectedId(item.id)}
                    >
                      <span className="num-badge">{numbers[item.id]}</span>
                      <span>
                        <span className="result-name">
                          {right ? '✓' : '✗'} {item.label}
                        </span>
                        {!right && (
                          <span className="result-yours">
                            {yourAnswer(item.id) ? `You answered: ${yourAnswer(item.id)}` : 'No answer'}
                          </span>
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
            </>
          ) : method === 'bank' ? (
            // ---- Word Bank ----
            <>
              <div className="hint">{bankHint()}</div>
              {selectedId && placed[selectedId] && (
                <button className="small-button remove-button" onClick={() => removeAnswer(selectedId)}>
                  Remove answer
                </button>
              )}
              <div className="chips">
                {bankOrder
                  .filter((id) => !Object.values(placed).includes(id))
                  .map((id) => (
                    <button
                      key={id}
                      className={`chip ${id === pickedName ? 'chip-selected' : ''}`}
                      onClick={() => tapName(id)}
                    >
                      {label(id)}
                    </button>
                  ))}
              </div>
              {answeredCount > 0 && (
                <section className="type-group">
                  <h3>Your answers</h3>
                  <div className="answer-list">
                    {inNumberOrder
                      .filter((item) => placed[item.id] !== undefined)
                      .map((item) => {
                        const nameId = placed[item.id]
                        return (
                          <div
                            key={item.id}
                            className={`answer-row ${selectedId === item.id ? 'answer-row-selected' : ''}`}
                          >
                            {/* The number: same as tapping the marker (selects it, or places a picked name there). */}
                            <button
                              className="answer-num"
                              aria-label={`Number ${numbers[item.id]}`}
                              onClick={() => tapMarker(item.id)}
                            >
                              <span className="num-badge">{numbers[item.id]}</span>
                            </button>
                            {/* The name: same as a word bank name (pick it up to move it). */}
                            <button
                              className={`answer-name ${nameId === pickedName ? 'chip-selected' : ''}`}
                              onClick={() => tapName(nameId)}
                            >
                              {label(nameId)}
                            </button>
                          </div>
                        )
                      })}
                  </div>
                </section>
              )}
              {answeredCount > 0 && onMethodChange && onRestart && (
                <p className="hint switch-note">To switch to Type It, tap Start over.</p>
              )}
            </>
          ) : (
            // ---- Type It ----
            <>
              <p className="hint">
                Type the name for each number. Capital letters, accents, and punctuation don't matter. Tap a number on
                the map to jump to its box.
              </p>
              <ol className="type-list">
                {inNumberOrder.map((item, index) => (
                  <li key={item.id} className={`type-row ${selectedId === item.id ? 'type-row-selected' : ''}`}>
                    <label className="num-badge" htmlFor={`answer-${item.id}`}>
                      {numbers[item.id]}
                    </label>
                    <input
                      id={`answer-${item.id}`}
                      ref={(el) => {
                        inputRefs.current[item.id] = el
                      }}
                      className="type-input"
                      type="text"
                      value={typed[item.id] ?? ''}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="words"
                      spellCheck={false}
                      enterKeyHint={index === inNumberOrder.length - 1 ? 'done' : 'next'}
                      onFocus={() => setSelectedId(item.id)}
                      onChange={(e) => {
                        const text = e.target.value
                        setTyped((old) => ({ ...old, [item.id]: text }))
                        setConfirmingBlanks(false)
                      }}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter') return
                        e.preventDefault()
                        const next = inNumberOrder[index + 1]
                        if (next) inputRefs.current[next.id]?.focus()
                        else e.currentTarget.blur()
                      }}
                    />
                  </li>
                ))}
              </ol>
              {answeredCount > 0 && onMethodChange && onRestart && (
                <p className="hint switch-note">To switch to Word Bank, tap Start over.</p>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
