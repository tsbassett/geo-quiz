// Nudges markers apart so none overlap, while keeping each one as close
// to its real spot as possible.

import type { Pt } from './geometry'

export interface MarkerBox {
  id: string
  /** Preferred center position. */
  x: number
  y: number
  /** Half the marker's width and height. */
  halfW: number
  halfH: number
  /** Round number markers push apart in any direction; wide name labels push sideways or up/down. */
  round: boolean
}

/** Something markers should not cover, like a city dot. */
export interface Obstacle {
  x: number
  y: number
  r: number
}

const GAP = 4 // pixels of space kept between markers

export function spreadMarkers(
  boxes: MarkerBox[],
  obstacles: Obstacle[],
  width: number,
  height: number,
): Record<string, Pt> {
  const pos = boxes.map((b) => ({ x: b.x, y: b.y }))

  // Moves markers a and b apart if they overlap. share = how much of the push "a" takes.
  const separate = (
    a: { x: number; y: number },
    ab: { halfW: number; halfH: number; round: boolean },
    b: { x: number; y: number },
    bb: { halfW: number; halfH: number; round: boolean },
    share: number,
    tieBreak: number,
  ) => {
    let dx = b.x - a.x
    let dy = b.y - a.y
    if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
      // Same spot: pick a direction so they can move apart.
      dx = Math.cos(tieBreak)
      dy = Math.sin(tieBreak)
    }
    if (ab.round && bb.round) {
      const needed = ab.halfW + bb.halfW + GAP
      const dist = Math.hypot(dx, dy)
      if (dist >= needed) return
      const push = needed - dist
      a.x -= (dx / dist) * push * share
      a.y -= (dy / dist) * push * share
      b.x += (dx / dist) * push * (1 - share)
      b.y += (dy / dist) * push * (1 - share)
      return
    }
    const overlapX = ab.halfW + bb.halfW + GAP - Math.abs(dx)
    const overlapY = ab.halfH + bb.halfH + GAP - Math.abs(dy)
    if (overlapX <= 0 || overlapY <= 0) return
    // Push along whichever direction needs the smaller move.
    if (overlapX < overlapY) {
      const s = Math.sign(dx) || 1
      a.x -= s * overlapX * share
      b.x += s * overlapX * (1 - share)
    } else {
      const s = Math.sign(dy) || 1
      a.y -= s * overlapY * share
      b.y += s * overlapY * (1 - share)
    }
  }

  const step = (pullBack: boolean) => {
    boxes.forEach((box, i) => {
      if (pullBack) {
        pos[i].x += (box.x - pos[i].x) * 0.03
        pos[i].y += (box.y - pos[i].y) * 0.03
      }
      // Keep off city dots (the dot never moves, so the marker takes the whole push).
      for (const o of obstacles) {
        const dot = { x: o.x, y: o.y }
        separate(dot, { halfW: o.r, halfH: o.r, round: box.round }, pos[i], box, 0, i)
      }
    })
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        separate(pos[i], boxes[i], pos[j], boxes[j], 0.5, i * 7 + j)
      }
    }
    // Keep every marker fully inside the map.
    boxes.forEach((box, i) => {
      pos[i].x = Math.min(width - box.halfW - 2, Math.max(box.halfW + 2, pos[i].x))
      pos[i].y = Math.min(height - box.halfH - 2, Math.max(box.halfH + 2, pos[i].y))
    })
  }

  for (let round = 0; round < 250; round++) step(true)
  for (let round = 0; round < 30; round++) step(false)

  return Object.fromEntries(boxes.map((b, i) => [b.id, [pos[i].x, pos[i].y] as Pt]))
}
