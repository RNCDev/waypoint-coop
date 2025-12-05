'use client'

import { useEffect } from 'react'
import { useAuthStore, DEMO_PERSONAS } from '@/store/auth-store'
import { isDemoMode } from '@/lib/demo-mode'

/**
 * Demo Mode Provider
 * 
 * Automatically initializes a demo persona when demo mode is enabled.
 * Uses the first demo persona (Alice Admin) as the default.
 */
export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const { currentPersona, setPersona } = useAuthStore()

  useEffect(() => {
    if (isDemoMode()) {
      // In demo mode, ensure we have a persona set
      // If no persona is set or persisted, use the first demo persona
      if (!currentPersona || !DEMO_PERSONAS.find((p) => p.userId === currentPersona.userId)) {
        setPersona(DEMO_PERSONAS[0]) // Default to Alice Admin
      }
    }
  }, [currentPersona, setPersona])

  return <>{children}</>
}
