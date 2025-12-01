'use client'

import { useAuthStore, DEMO_PERSONAS, type Persona } from '@/store/auth-store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, User, Sparkles } from 'lucide-react'
import Link from 'next/link'

const orgTypeColors: Record<string, string> = {
  PLATFORM_ADMIN: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  GP: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  LP: 'bg-green-500/20 text-green-400 border-green-500/30',
  FUND_ADMIN: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  AUDITOR: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  CONSULTANT: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  TAX_ADVISOR: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
}

const orgTypeLabels: Record<string, string> = {
  PLATFORM_ADMIN: 'Platform Admin',
  GP: 'Asset Manager',
  LP: 'Limited Partner',
  FUND_ADMIN: 'Fund Admin',
  AUDITOR: 'Auditor',
  CONSULTANT: 'Consultant',
  TAX_ADVISOR: 'Tax Advisor',
}

export function PersonaSwitcher() {
  const { currentPersona, setPersona } = useAuthStore()

  const handlePersonaChange = (persona: Persona) => {
    setPersona(persona)
    // Reload the page to refresh data based on new persona
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-1.5">
      {/* Onboarding Demo Link */}
      <Link
        href="/demo/onboarding"
        className="flex items-center gap-1 px-1.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors group"
        title="Launch Onboarding Demo"
      >
        <Sparkles className="w-3 h-3 text-amber-400 group-hover:text-amber-300" />
        <span className="text-[10px] font-medium text-amber-400 group-hover:text-amber-300 hidden sm:inline">Demo</span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-3 h-3 text-primary" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-light leading-tight">{currentPersona.userName}</div>
                <div className="text-[10px] text-muted-foreground font-light leading-tight">
                  {currentPersona.organizationName}
                </div>
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-[10px] font-light text-muted-foreground px-2 py-1.5">
          Switch Persona
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {DEMO_PERSONAS.map((persona) => (
          <DropdownMenuItem
            key={persona.userId}
            onClick={() => handlePersonaChange(persona)}
            className={`flex items-center gap-2 p-2 cursor-pointer ${
              currentPersona.userId === persona.userId ? 'bg-primary/5' : ''
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-3 h-3 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-light text-xs leading-tight">{persona.userName}</span>
                {currentPersona.userId === persona.userId && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0 bg-primary/20 text-primary border-primary/30">
                    Active
                  </Badge>
                )}
              </div>
              <div className="text-[10px] text-muted-foreground font-light leading-tight mt-0.5">
                {persona.organizationName}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

