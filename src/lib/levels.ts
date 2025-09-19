import { Car, LevelDef, Track, TrackLabel, YardState } from './types'
import { pickColorsForLabels } from './palette'

export function parseLevels(text: string): LevelDef[] {
  const parts = text
    .split(/\n\s*---\s*\n/g)
    .map((s) => s.trim())
    .filter(Boolean)
  const levels: LevelDef[] = []
  for (const part of parts) {
    const lines = part.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    if (lines.length === 0) continue
    const maxLine = lines[0]
    const m = /^maxCars:\s*(\d+)/i.exec(maxLine)
    if (!m) throw new Error('Level missing maxCars header')
    const max = parseInt(m[1], 10)
    const tracks: { label: string; cars: string[] }[] = []
    for (const line of lines.slice(1)) {
      const mm = /^(\w):\s*([a-zA-Z\s]*)$/.exec(line)
      if (!mm) throw new Error(`Invalid track line: ${line}`)
      const label = mm[1].toUpperCase()
      const cars = mm[2]
        .split(/\s*/)
        .filter((c) => /[a-zA-Z]/.test(c))
        .map((c) => c.toUpperCase())
      tracks.push({ label, cars })
    }
    levels.push({ maxCars: max, tracks })
  }
  return levels
}

export function buildInitialState(level: LevelDef): YardState {
  const labels = level.tracks.map((t) => t.label)
  const colorMap = pickColorsForLabels(labels)
  let carIdSeq = 1
  const tracks: Track[] = level.tracks.map((t) => ({
    label: t.label,
    color: colorMap[t.label],
    cars: t.cars.map((target) => ({ id: String(carIdSeq++), target }))
  }))

  const initiallyCorrect = countCorrectCars(tracks)

  return {
    maxCars: level.maxCars,
    tracks,
    head: [],
    steps: 0,
    initiallyCorrect
  }
}

export function countCorrectCars(tracks: Track[]): number {
  let ok = 0
  for (const tr of tracks) {
    for (const car of tr.cars) {
      if (car.target === tr.label) ok++
    }
  }
  return ok
}
