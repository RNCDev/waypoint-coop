'use client'

import { AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { isDemoMode, getDemoModeMessage } from '@/lib/demo-mode'

export function DemoBanner() {
  if (!isDemoMode()) {
    return null
  }

  return (
    <div className="w-full bg-yellow-500/20 border-b border-yellow-500/30 px-4 py-2">
      <div className="container mx-auto max-w-7xl flex items-center gap-2 text-sm">
        <AlertCircle className="w-4 h-4 text-yellow-400" />
        <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-xs">
          DEMO
        </Badge>
        <span className="text-yellow-300">{getDemoModeMessage()}</span>
      </div>
    </div>
  )
}
