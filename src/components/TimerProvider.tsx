'use client'

import { createContext, useContext, useState } from 'react'
import { FocusTimer } from './FocusTimer'

interface TimerContextType {
  showTimer: () => void
}

const TimerContext = createContext<TimerContextType>({ showTimer: () => {} })

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)

  return (
    <TimerContext.Provider value={{ showTimer: () => setVisible(true) }}>
      {children}
      {visible && <FocusTimer onClose={() => setVisible(false)} />}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  return useContext(TimerContext)
}
