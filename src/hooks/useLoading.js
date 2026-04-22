import { useState, useEffect } from 'react'

export function useLoading(delay = 220) {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), delay)
    return () => clearTimeout(t)
  }, [])
  return loading
}
