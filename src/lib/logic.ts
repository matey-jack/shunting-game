import { MoveResult, YardState } from './types'

// Move from a siding: pick car at index i (0-based, left-to-right), take that car and all cars to its right to the head shunt (added to LEFT side)
export function moveFromSidingToHead(state: YardState, trackIndex: number, carIndex: number): MoveResult {
  const t = state.tracks[trackIndex]
  if (!t) return { ok: false, reason: 'not-found' }
  if (carIndex < 0 || carIndex >= t.cars.length) return { ok: false, reason: 'not-found' }
  const moving = t.cars.slice(carIndex)
  // Capacity: head shunt max N
  if (state.head.length + moving.length > state.maxCars) {
    return { ok: false, reason: 'capacity' }
  }
  const next: YardState = {
    ...state,
    tracks: state.tracks.map((tr, idx) => idx === trackIndex ? { ...tr, cars: tr.cars.slice(0, carIndex) } : tr),
    head: [...moving, ...state.head], // incoming cars attach to the LEFT side (near sidings)
    steps: state.steps + 1
  }
  return { ok: true, next }
}

// Move from head to destination siding: pick car at index i (0-based), move 0..i to that car's target siding
export function moveFromHeadToDest(state: YardState, headIndex: number): MoveResult {
  if (headIndex < 0 || headIndex >= state.head.length) return { ok: false, reason: 'not-found' }
  const moving = state.head.slice(0, headIndex + 1)
  const targetLabel = state.head[headIndex].target
  const trackIndex = state.tracks.findIndex((t) => t.label === targetLabel)
  if (trackIndex === -1) return { ok: false, reason: 'invalid' }
  const tr = state.tracks[trackIndex]
  if (tr.cars.length + moving.length > state.maxCars) {
    return { ok: false, reason: 'capacity' }
  }
  const next: YardState = {
    ...state,
    tracks: state.tracks.map((t, idx) => idx === trackIndex ? { ...t, cars: [...t.cars, ...moving] } : t),
    head: state.head.slice(headIndex + 1),
    steps: state.steps + 1
  }
  return { ok: true, next }
}

// Move from head by explicit drop to a chosen siding label
export function moveFromHeadToTrack(state: YardState, headIndex: number, trackIndex: number): MoveResult {
  if (headIndex < 0 || headIndex >= state.head.length) return { ok: false, reason: 'not-found' }
  const moving = state.head.slice(0, headIndex + 1)
  const tr = state.tracks[trackIndex]
  if (!tr) return { ok: false, reason: 'not-found' }
  if (tr.cars.length + moving.length > state.maxCars) {
    return { ok: false, reason: 'capacity' }
  }
  const next: YardState = {
    ...state,
    tracks: state.tracks.map((t, idx) => idx === trackIndex ? { ...t, cars: [...t.cars, ...moving] } : t),
    head: state.head.slice(headIndex + 1),
    steps: state.steps + 1
  }
  return { ok: true, next }
}

export function countNowCorrect(state: YardState): number {
  let ok = 0
  for (const tr of state.tracks) {
    for (const car of tr.cars) {
      if (car.target === tr.label) ok++
    }
  }
  return ok - state.initiallyCorrect
}

export function countNowIncorrect(state: YardState): number {
  let total = 0
  let correctlyPlaced = 0
  for (const tr of state.tracks) {
    total += tr.cars.length
    for (const car of tr.cars) {
      if (car.target === tr.label) correctlyPlaced++
    }
  }
  return total - correctlyPlaced
}
