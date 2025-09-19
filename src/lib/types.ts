export type TrackLabel = string // single uppercase letter like 'A'

export interface Car {
  id: string
  target: TrackLabel
}

export interface Track {
  label: TrackLabel
  cars: Car[] // ordered left-to-right; rightmost is at the head shunt side
  color: string
}

export interface YardState {
  maxCars: number
  tracks: Track[]
  head: Car[] // left-to-right; leftmost near sidings
  steps: number
  // baseline count of cars that were already on their destination track at start
  initiallyCorrect: number
}

export interface LevelDef {
  maxCars: number
  tracks: { label: TrackLabel; cars: TrackLabel[] }[]
}

export interface MoveResult {
  ok: boolean
  reason?: 'capacity' | 'invalid' | 'not-found'
  next?: YardState
}
