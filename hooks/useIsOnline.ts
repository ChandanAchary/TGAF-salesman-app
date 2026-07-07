import { useEffect, useState } from 'react'
import { onlineManager } from '@tanstack/react-query'

export const useIsOnline = () => {
  const [isOnline, setIsOnline] = useState(onlineManager.isOnline())

  useEffect(() => {
    const unsubscribe = onlineManager.subscribe(() => {
      setIsOnline(onlineManager.isOnline())
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return isOnline
}
