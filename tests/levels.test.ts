import { describe, it, expect } from 'vitest'
import { parseLevels, buildInitialState, countCorrectCars } from '../src/lib/levels'

const sample = `maxCars: 5
A: bcabc
B: bcdd
C: d d d 
D: a b c d
---
maxCars: 3
A: bb
B: cca
C: aa
`

describe('parseLevels', () => {
  it('parses multiple levels and spaces', () => {
    const levels = parseLevels(sample)
    expect(levels.length).toBe(2)
    expect(levels[0].maxCars).toBe(5)
    expect(levels[0].tracks[0]).toEqual({ label: 'A', cars: ['B','C','A','B','C'] })
    expect(levels[0].tracks[2]).toEqual({ label: 'C', cars: ['D','D','D'] })
    expect(levels[0].tracks[3]).toEqual({ label: 'D', cars: ['A','B','C','D'] })
    expect(levels[1].tracks[1]).toEqual({ label: 'B', cars: ['C','C','A'] })
  })

  it('builds initial state with colors and counts', () => {
    const level = parseLevels(sample)[0]
    const state = buildInitialState(level)
    expect(state.maxCars).toBe(5)
    expect(state.tracks.length).toBe(4)
    expect(state.head.length).toBe(0)
    // initiallyCorrect counts cars already on their destination track
    const baseline = countCorrectCars(state.tracks)
    expect(state.initiallyCorrect).toBe(baseline)
  })
})
