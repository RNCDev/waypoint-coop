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
import { ChevronDown, User } from 'lucide-react'

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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 px-1.5 py-1.5 pr-3 rounded-full border border-primary/50 bg-primary/10 hover:bg-primary/20 hover:border-primary hover:shadow-[0_0_15px_-3px_rgba(59,130,246,0.5)] transition-all duration-300 group">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-sm font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">{currentPersona.userName}</div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-y-0.5 transition-all" />
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

