import { useEffect, useState } from 'react'

/**
 * The current screen, read from the part of the address after "#"
 * (for example "#/region/east-asia"). Using the address means the browser's
 * Back button and the iPad's swipe-back gesture return to the previous screen.
 */
export function useHashRoute(): string[] {
  const [hash, setHash] = useState(() => window.location.hash)

  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  // "#/region/east-asia" -> ["region", "east-asia"]
  return hash.replace(/^#\/?/, '').split('/').filter(Boolean)
}
