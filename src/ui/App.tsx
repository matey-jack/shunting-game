import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { LevelDef, YardState } from '../lib/types'
import { buildInitialState, parseLevels } from '../lib/levels'
import { countNowCorrect, countNowIncorrect, moveFromHeadToDest, moveFromHeadToTrack, moveFromSidingToHead } from '../lib/logic'
import { defaultLevelsText } from './defaultLevels'

function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null)
  const ensure = () => {
    if (!ctxRef.current) {
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext
      if (Ctx) ctxRef.current = new Ctx()
    }
    return ctxRef.current
  }
  const reject = () => {
    const ctx = ensure()
    if (!ctx) return
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = 110 // bass A2
    g.gain.value = 0.0001
    o.connect(g)
    g.connect(ctx.destination)
    o.start()
    const now = ctx.currentTime
    g.gain.exponentialRampToValueAtTime(0.2, now + 0.02)
    g.gain.exponentialRampToValueAtTime(0.00001, now + 0.25)
    o.stop(now + 0.3)
  }
  return { reject }
}

export function App() {
  const [levelsText, setLevelsText] = useState(defaultLevelsText)
  const [levels, setLevels] = useState<LevelDef[]>(() => parseLevels(defaultLevelsText))
  const [levelIndex, setLevelIndex] = useState(0)
  const [state, setState] = useState<YardState>(() => buildInitialState(parseLevels(defaultLevelsText)[0]))
  const [flash, setFlash] = useState<string | null>(null)
  const audio = useAudio()

  useEffect(() => {
    try {
      const ls = parseLevels(levelsText)
      setLevels(ls)
      if (ls[levelIndex]) {
        setState(buildInitialState(ls[levelIndex]))
      } else if (ls.length > 0) {
        setLevelIndex(0)
        setState(buildInitialState(ls[0]))
      }
    } catch {
      // ignore live parse errors until user clicks apply
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSelectLevel = (idx: number) => {
    setLevelIndex(idx)
    setState(buildInitialState(levels[idx]))
  }

  const reject = (where: string) => {
    setFlash(where + ':' + String(Date.now()))
    audio.reject()
    setTimeout(() => setFlash(null), 800)
  }

  const doMoveFromSiding = (trackIdx: number, carIdx: number) => {
    const res = moveFromSidingToHead(state, trackIdx, carIdx)
    if (!res.ok) return reject(`siding-${trackIdx}`)
    setState(res.next!)
  }
  const doMoveFromHeadToDest = (i: number) => {
    const res = moveFromHeadToDest(state, i)
    if (!res.ok) return reject('head')
    setState(res.next!)
  }
  const doMoveFromHeadToTrack = (i: number, trackIdx: number) => {
    const res = moveFromHeadToTrack(state, i, trackIdx)
    if (!res.ok) return reject('head')
    setState(res.next!)
  }

  // Drag and drop from head (0..i) to track
  const dragHeadIndex = useRef<number | null>(null)

  const onHeadDragStart = (i: number, e: DragEvent) => {
    dragHeadIndex.current = i
    e.dataTransfer?.setData('text/plain', String(i))
    e.dataTransfer!.effectAllowed = 'move'
  }
  const onTrackDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.dataTransfer!.dropEffect = 'move'
  }
  const onTrackDrop = (trackIdx: number, e: DragEvent) => {
    e.preventDefault()
    const data = e.dataTransfer?.getData('text/plain')
    const i = data ? parseInt(data, 10) : dragHeadIndex.current
    if (i == null || Number.isNaN(i)) return
    doMoveFromHeadToTrack(i, trackIdx)
    dragHeadIndex.current = null
  }

  const correct = countNowCorrect(state)
  const incorrect = countNowIncorrect(state)

  return (
    <div>
      <div class="statusbar">
        <div class="pill">Steps: <b>{state.steps}</b></div>
        <div class="pill">Cars correctly placed: <b>{correct}</b></div>
        <div class="pill">Cars remaining: <b>{incorrect}</b></div>
        <div class="pill muted">Max per track/head: {state.maxCars}</div>
      </div>
      <div class="container">
        <div class="leftPane">
          <div class="sidingsAndHead">
            <div class="yard">
              {state.tracks.map((tr, tIdx) => (
                <div class="track" key={tr.label}>
                  <div class="trackLabel" style={{ background: tr.color }} title={`Track ${tr.label}`}>{tr.label}</div>
                  <div class="trackLine" onDragOver={onTrackDragOver as any} onDrop={(e) => onTrackDrop(tIdx, e as any)}>
                    {tr.cars.map((car, cIdx) => (
                      <div class="car" title={`Car to ${car.target}`} style={{ background: colorFor(state, car.target) }} onClick={() => doMoveFromSiding(tIdx, cIdx)}>
                        {car.target}
                      </div>
                    ))}
                    {flash?.startsWith(`siding-${tIdx}`) && <div class="rejection">!</div>}
                  </div>
                </div>
              ))}
            </div>
            <div class="head">
              <div class="loco" title="Shunting locomotive" />
              <div class="headCars">
                {state.head.map((car, i) => (
                  <div class="car small" draggable title={`Car to ${car.target}: click to send to ${car.target}, or drag left block to a track`} onDragStart={(e) => onHeadDragStart(i, e as any)} onClick={() => doMoveFromHeadToDest(i)} style={{ background: colorFor(state, car.target) }}>
                    {car.target}
                  </div>
                ))}
                {flash?.startsWith('head') && <div class="rejection">!</div>}
              </div>
            </div>
          </div>
        </div>
        <div class="rightPane">
          <Controls
            levels={levels}
            levelIndex={levelIndex}
            onSelectLevel={onSelectLevel}
            onApplyLevels={(txt) => {
              try {
                const ls = parseLevels(txt)
                setLevelsText(txt)
                setLevels(ls)
                setLevelIndex(0)
                setState(buildInitialState(ls[0]))
              } catch (e) {
                alert('Invalid level text: ' + (e as Error).message)
              }
            }}
            levelsText={levelsText}
            onLevelsTextChange={setLevelsText}
          />
        </div>
      </div>
    </div>
  )
}

function colorFor(state: YardState, label: string): string {
  const tr = state.tracks.find((t) => t.label === label)
  return tr?.color || '#999'
}

function Controls(props: {
  levels: LevelDef[]
  levelIndex: number
  onSelectLevel: (idx: number) => void
  onApplyLevels: (txt: string) => void
  levelsText: string
  onLevelsTextChange: (txt: string) => void
}) {
  const { levels, levelIndex, onSelectLevel, onApplyLevels, levelsText, onLevelsTextChange } = props
  return (
    <div class="controls">
      <div>
        <label>
          Level: 
          <select value={String(levelIndex)} onChange={(e) => onSelectLevel(parseInt((e.target as HTMLSelectElement).value, 10))}>
            {levels.map((lvl, i) => (
              <option value={String(i)}>Level {i + 1}: {lvl.tracks.length} tracks, max {lvl.maxCars}</option>
            ))}
          </select>
        </label>
        <button style={{ marginLeft: 8 }} onClick={() => onSelectLevel(levelIndex)} title="Restart level">Restart</button>
      </div>
      <div class="muted">Click a car in a siding to pull it and cars right of it to the head shunt. Click a car in the head shunt to push that car and all cars to its left to its destination siding. Or drag from the head shunt to a siding to choose target.</div>
      <div>
        <textarea class="levelInput" value={levelsText} onInput={(e) => onLevelsTextChange((e.target as HTMLTextAreaElement).value)} />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={() => onApplyLevels(levelsText)}>Apply Levels</button>
        </div>
      </div>
    </div>
  )
}
