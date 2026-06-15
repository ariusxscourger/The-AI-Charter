import { env } from "@/env"
import { useEffect, useRef } from "react"

export function usePolling(
  callback: () => Promise<void> | void,
  delay: number | null = env.NEXT_PUBLIC_POLL_INTERVAL_MS,
) {
  const savedCallback = useRef(callback)

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval
  useEffect(() => {
    if (delay === null) return

    const tick = () => savedCallback.current()
    const id = setInterval(tick, delay)

    return () => clearInterval(id)
  }, [delay])
}
