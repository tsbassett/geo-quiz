// Small helpers shared by Practice and Test.

import type { Item, Region } from '../data/types'
import { makeProjection, markerAnchor, regionAspect } from '../map/geometry'

/** Returns a copy of the list in random order. */
export function shuffle<T>(list: T[]): T[] {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Simplifies an answer for comparing: lowercase, no accents, and no spaces or
 * punctuation. So "Huang-He", "huang he", and "HUANG HE" all match.
 */
export function normalizeAnswer(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '') // remove accent marks
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // remove spaces and punctuation
}

/** True if the typed text matches the item's name or one of its accepted spellings. */
export function isTypedAnswerCorrect(item: Item, typed: string): boolean {
  const answer = normalizeAnswer(typed)
  if (!answer) return false
  return [item.label, ...(item.accept ?? [])].some((name) => normalizeAnswer(name) === answer)
}

const ROWS = 6 // how many horizontal bands the map is sliced into for numbering

/**
 * Numbers items 1, 2, 3... in reading order: row by row from the top of the map,
 * left to right within each row. The row lines shift randomly each round, so
 * items near a line swap places and the numbers change from round to round.
 */
export function numberItems(region: Region, items: Item[]): Record<string, string> {
  // Lay the map out at a fixed size just to compare marker positions.
  const width = 1000
  const height = width / regionAspect(region.bbox)
  const projection = makeProjection(region.bbox, width, height)
  const rowHeight = height / ROWS
  const rowShift = Math.random() * rowHeight

  const placed = items.map((item) => {
    const [x, y] = markerAnchor(item, projection) ?? [0, 0]
    return { id: item.id, row: Math.floor((y + rowShift) / rowHeight), x }
  })
  placed.sort((a, b) => a.row - b.row || a.x - b.x)
  return Object.fromEntries(placed.map((p, index) => [p.id, String(index + 1)]))
}
