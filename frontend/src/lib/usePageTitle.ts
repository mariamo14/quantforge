import { useEffect } from 'react'

/** Sets the browser tab title, restoring the app default on unmount. */
export function usePageTitle(title: string | undefined) {
  useEffect(() => {
    if (title) {
      document.title = `${title} · QuantForge`
    }
    return () => {
      document.title = 'QuantForge'
    }
  }, [title])
}
