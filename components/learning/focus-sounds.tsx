"use client"

import { useEffect, useRef, useState, useCallback } from "react"

type SoundType = "white" | "brown" | "rain" | "ocean"

interface Sound {
  id: SoundType
  label: string
  emoji: string
}

const SOUNDS: Sound[] = [
  { id: "white", label: "White", emoji: "〰" },
  { id: "brown", label: "Brown", emoji: "🟫" },
  { id: "rain",  label: "Rain",  emoji: "🌧" },
  { id: "ocean", label: "Ocean", emoji: "🌊" },
]

interface FocusSoundsProps {
  playing: boolean  // syncs with timer running state
}

export function FocusSounds({ playing }: FocusSoundsProps) {
  const [active, setActive] = useState<SoundType | null>(null)
  const [volume, setVolume] = useState(0.3)
  const ctxRef = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const nodesRef = useRef<AudioNode[]>([])

  const stopSound = useCallback(() => {
    nodesRef.current.forEach((n) => { try { (n as AudioBufferSourceNode).stop() } catch {} })
    nodesRef.current = []
  }, [])

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
      gainRef.current = ctxRef.current.createGain()
      gainRef.current.gain.value = volume
      gainRef.current.connect(ctxRef.current.destination)
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume()
    return ctxRef.current
  }, [volume])

  const playSound = useCallback((type: SoundType) => {
    stopSound()
    const ctx = getCtx()
    const gain = gainRef.current!

    if (type === "white") {
      // Pure white noise
      const bufLen = ctx.sampleRate * 2
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.loop = true
      src.connect(gain)
      src.start()
      nodesRef.current = [src]
    }

    if (type === "brown") {
      // Brown (red) noise — integrated white noise
      const bufLen = ctx.sampleRate * 2
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
      const data = buf.getChannelData(0)
      let last = 0
      for (let i = 0; i < bufLen; i++) {
        const w = Math.random() * 2 - 1
        last = (last + 0.02 * w) / 1.02
        data[i] = last * 3.5
      }
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.loop = true
      src.connect(gain)
      src.start()
      nodesRef.current = [src]
    }

    if (type === "rain") {
      // White noise through low-pass filter + slow tremolo (LFO on gain)
      const bufLen = ctx.sampleRate * 2
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.loop = true

      const lpf = ctx.createBiquadFilter()
      lpf.type = "lowpass"
      lpf.frequency.value = 800
      lpf.Q.value = 0.5

      // LFO for rainfall variation — modulates a gain node in the signal path
      const tremolo = ctx.createGain()
      tremolo.gain.value = 1
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = 0.4
      const lfo = ctx.createOscillator()
      lfo.type = "sine"
      lfo.frequency.value = 0.3
      lfo.connect(lfoGain)
      lfoGain.connect(tremolo.gain)

      src.connect(lpf)
      lpf.connect(tremolo)
      tremolo.connect(gain)
      src.start()
      lfo.start()
      nodesRef.current = [src, lfo]
    }

    if (type === "ocean") {
      // Brown noise through resonant low-pass + slow LFO sweep
      const bufLen = ctx.sampleRate * 2
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
      const data = buf.getChannelData(0)
      let last = 0
      for (let i = 0; i < bufLen; i++) {
        last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02
        data[i] = last * 3.5
      }
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.loop = true

      const lpf = ctx.createBiquadFilter()
      lpf.type = "lowpass"
      lpf.frequency.value = 400
      lpf.Q.value = 1.5

      // Slow LFO to sweep filter freq (wave motion)
      const lfo = ctx.createOscillator()
      lfo.type = "sine"
      lfo.frequency.value = 0.1
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = 200
      lfo.connect(lfoGain)
      lfoGain.connect(lpf.frequency)

      src.connect(lpf)
      lpf.connect(gain)
      src.start()
      lfo.start()
      nodesRef.current = [src, lfo]
    }
  }, [stopSound, getCtx])

  // Sync play/stop with timer state
  useEffect(() => {
    if (!playing && active) {
      ctxRef.current?.suspend()
    } else if (playing && active) {
      ctxRef.current?.resume()
    }
  }, [playing, active])

  // Update volume live
  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = volume
  }, [volume])

  // Cleanup on unmount
  useEffect(() => () => { stopSound(); ctxRef.current?.close() }, [stopSound])

  const toggle = (id: SoundType) => {
    if (active === id) {
      stopSound()
      ctxRef.current?.suspend()
      setActive(null)
    } else {
      setActive(id)
      playSound(id)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Focus sounds</p>
      <div className="flex gap-2">
        {SOUNDS.map((s) => (
          <button
            key={s.id}
            onClick={() => toggle(s.id)}
            title={s.label}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              active === s.id
                ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-300"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <span className="text-base leading-none">{s.emoji}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>
      {active && (
        <div className="flex items-center gap-2 w-full max-w-[200px]">
          <span className="text-xs text-gray-400">🔈</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1 h-1 accent-indigo-600"
          />
          <span className="text-xs text-gray-400">🔊</span>
        </div>
      )}
    </div>
  )
}
