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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, User, Building2, Shield } from 'lucide-react'

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-card border-border/50 hover:bg-card hover:border-border"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-light">{currentPersona.userName}</div>
              <div className="text-xs text-muted-foreground font-light">
                {currentPersona.organizationName}
              </div>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-xs font-light text-muted-foreground px-3 py-2">
          Switch Persona
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {DEMO_PERSONAS.map((persona) => (
          <DropdownMenuItem
            key={persona.userId}
            onClick={() => handlePersonaChange(persona)}
            className={`flex items-center gap-3 p-3 cursor-pointer ${
              currentPersona.userId === persona.userId ? 'bg-primary/5' : ''
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-light text-sm">{persona.userName}</span>
                {currentPersona.userId === persona.userId && (
                  <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-primary/30">
                    Active
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground font-light mt-0.5">
                {persona.organizationName}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

