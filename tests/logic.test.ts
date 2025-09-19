import { describe, it, expect } from 'vitest'
import { buildInitialState, parseLevels } from '../src/lib/levels'
import { moveFromSidingToHead, moveFromHeadToDest, moveFromHeadToTrack, countNowCorrect, countNowIncorrect } from '../src/lib/logic'

const levelTxt = `maxCars: 4
A: BC
B: 
C: 
D: 
`

describe('move logic', () => {
  it('moves from siding to head and respects capacity', () => {
    let state = buildInitialState(parseLevels(levelTxt)[0])
    expect(state.head.length).toBe(0)
    // Move both cars from track A
    let res = moveFromSidingToHead(state, 0, 0)
    expect(res.ok).toBe(true)
    state = res.next!
    expect(state.head.map(c => c.target)).toEqual(['B','C'])

    // Try to move again from empty should fail not-found
    res = moveFromSidingToHead(state, 0, 0)
    expect(res.ok).toBe(false)

    // Fill head to capacity
    state = { ...state, tracks: state.tracks.map((t,i)=> i===1? { ...t, cars: [{id:'x', target:'A'},{id:'y', target:'A'}]}: t) }
    // Move 2 from B would exceed max 4 (currently head has 2)
    res = moveFromSidingToHead(state, 1, 0)
    expect(res.ok).toBe(true)
    state = res.next!
    expect(state.head.length).toBe(4)
    // Now any more should be capacity failure
    const state2 = { ...state, tracks: state.tracks.map((t,i)=> i===2? { ...t, cars: [{id:'z', target:'A'}]}: t) }
    const res2 = moveFromSidingToHead(state2, 2, 0)
    expect(res2.ok).toBe(false)
  })

  it('moves from head to destination siding and explicit track', () => {
    let state = buildInitialState(parseLevels(levelTxt)[0])
    let res = moveFromSidingToHead(state, 0, 0) // pull BC
    state = res.next!
    // Click second car (index 1) to push both to C's target (C)
    res = moveFromHeadToDest(state, 1)
    expect(res.ok).toBe(true)
    state = res.next!
    expect(state.head.length).toBe(0)
    const cTrack = state.tracks.find(t => t.label==='C')!
    expect(cTrack.cars.map(c=>c.target)).toEqual(['B','C'])

    // Now drag/push explicitly to A
    state = buildInitialState(parseLevels(levelTxt)[0])
    res = moveFromSidingToHead(state, 0, 0)
    state = res.next!
    res = moveFromHeadToTrack(state, 0, 3) // to D
    expect(res.ok).toBe(true)
    state = res.next!
    expect(state.tracks.find(t=>t.label==='D')!.cars.length).toBe(1)
  })

  it('counts correctness and remaining', () => {
    const state = buildInitialState(parseLevels(`maxCars: 3\nA: A\nB: C\nC: B\n`)[0])
    // Initially A is correct but excluded from progress; B and C are incorrect
    expect(countNowCorrect(state)).toBe(0)
    expect(countNowIncorrect(state)).toBe(2)
  })
})
