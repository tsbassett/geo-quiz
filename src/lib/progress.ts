// Saves best scores and test history in the browser (localStorage), so they
// are still there after closing the app. Nothing is sent anywhere.

export type Method = 'bank' | 'type'

export const METHOD_NAMES: Record<Method, string> = { bank: 'Word Bank', type: 'Type It' }

/** Used in place of a region slug for Full Test records. */
export const FULL_TEST = 'full-test'

export interface RegionScore {
  slug: string
  score: number
  total: number
}

export interface TestRecord {
  /** When the test was submitted (ISO date format). */
  date: string
  /** The region's slug, or FULL_TEST. */
  region: string
  method: Method
  score: number
  total: number
  percent: number
  /** Every item on the test, as "region-slug:item-id". */
  tested: string[]
  /** The items answered wrong, as "region-slug:item-id". */
  missed: string[]
  /** Full Test only: the score for each region. */
  breakdown?: RegionScore[]
}

export interface Progress {
  /** Best test percentage for each region slug. */
  best: Record<string, number>
  /** Every finished test, oldest first. */
  history: TestRecord[]
  /** The answer method used last, so Test mode remembers it. */
  method: Method
}

const STORAGE_KEY = 'geo-quiz-progress'

function emptyProgress(): Progress {
  return { best: {}, history: [], method: 'bank' }
}

export function loadProgress(): Progress {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!saved || typeof saved !== 'object') return emptyProgress()
    return {
      best: saved.best && typeof saved.best === 'object' ? saved.best : {},
      history: Array.isArray(saved.history) ? saved.history : [],
      method: saved.method === 'type' ? 'type' : 'bank',
    }
  } catch {
    return emptyProgress() // storage blocked or data damaged: start fresh
  }
}

function saveProgress(progress: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Storage is full or blocked (for example, some private browsing modes). Nothing else to do.
  }
}

/** Erases best scores, history, and the remembered answer method. */
export function resetProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage blocked: nothing was saved anyway.
  }
}

export function saveMethod(method: Method) {
  saveProgress({ ...loadProgress(), method })
}

/** A name for an item that is unique across all regions. */
export function itemKey(regionSlug: string, itemId: string): string {
  return `${regionSlug}:${itemId}`
}

export function percentOf(score: number, total: number): number {
  return total ? Math.round((score / total) * 100) : 0
}

/**
 * Saves a finished test to the history and updates each region's best score.
 * Returns the slugs of regions that got a new best score.
 */
export function recordTest(record: Omit<TestRecord, 'date' | 'percent'>, regionScores: RegionScore[]): string[] {
  const progress = loadProgress()
  progress.history.push({
    ...record,
    date: new Date().toISOString(),
    percent: percentOf(record.score, record.total),
  })
  const newBests: string[] = []
  for (const { slug, score, total } of regionScores) {
    const percent = percentOf(score, total)
    if (progress.best[slug] === undefined || percent > progress.best[slug]) {
      progress.best[slug] = percent
      newBests.push(slug)
    }
  }
  progress.method = record.method
  saveProgress(progress)
  return newBests
}

export type Mastery = 'none' | 'low' | 'mid' | 'high'

/** Gray = not started, red = under 60%, yellow = 60 to 89%, green = 90% and above. */
export function masteryOf(best: number | undefined): Mastery {
  if (best === undefined) return 'none'
  if (best >= 90) return 'high'
  if (best >= 60) return 'mid'
  return 'low'
}

export interface TroubleSpot {
  key: string
  missed: number
  tested: number
}

/** The items missed most often across all tests (most misses first). */
export function troubleSpots(history: TestRecord[], limit = 10): TroubleSpot[] {
  const counts = new Map<string, TroubleSpot>()
  const countFor = (key: string) => {
    let entry = counts.get(key)
    if (!entry) counts.set(key, (entry = { key, missed: 0, tested: 0 }))
    return entry
  }
  for (const record of history) {
    for (const key of record.tested) countFor(key).tested++
    for (const key of record.missed) countFor(key).missed++
  }
  return [...counts.values()]
    .filter((spot) => spot.missed > 0)
    .sort((a, b) => b.missed - a.missed || b.missed / b.tested - a.missed / a.tested)
    .slice(0, limit)
}

/** For example "Sep 12, 3:40 PM". */
export function formatWhen(isoDate: string): string {
  return new Date(isoDate).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** For example "Sep 12". */
export function formatDay(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
