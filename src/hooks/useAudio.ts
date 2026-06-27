import { useEffect, useRef } from 'react'
import { Howl } from 'howler'

export function useAudio(src: string, loop = false) {
  const soundRef = useRef<Howl | null>(null)

  useEffect(() => {
    soundRef.current = new Howl({ src: [src], loop, volume: 0.5 })
    return () => {
      soundRef.current?.stop()
    }
  }, [src, loop])

  return {
    play: () => soundRef.current?.play(),
    stop: () => soundRef.current?.stop(),
    pause: () => soundRef.current?.pause(),
  }
}
