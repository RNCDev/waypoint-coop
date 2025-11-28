'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, User } from 'lucide-react'

export function Navbar() {
  const router = useRouter()
  const { currentUser, currentOrg, personas, setPersona } = useAuthStore()

  const handlePersonaSwitch = (userId: number) => {
    setPersona(userId)
    // Redirect to home page after switching personas
    router.push('/')
  }

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <nav className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center gap-6">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-primary hover:text-primary/80 transition-colors shrink-0">
            Waypoint
          </Link>
          
          {/* Separator */}
          {currentUser && (
            <div className="h-6 w-px bg-border/40 shrink-0" />
          )}
          
          {/* Navigation */}
          {currentUser && (
            <div className="flex items-center gap-4">
              {/* Waypoint Platform Admin - Registry and Audit only */}
              {currentUser.role === 'Platform Admin' || currentOrg?.role === 'Platform Admin' ? (
                <>
                  <Link href="/registry" className="text-sm hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
                    Registry
                  </Link>
                  <Link href="/audit" className="text-sm hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
                    Audit
                  </Link>
                  <Link href="/iam" className="text-sm hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
                    IAM
                  </Link>
                </>
              ) : null}
              {/* Publishers and Asset Owners - Composer and History */}
              {(currentUser.role === 'Publisher' || currentUser.role === 'Asset Owner') && currentOrg?.role !== 'Platform Admin' ? (
                <>
                  <Link href="/composer" className="text-sm hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
                    Composer
                  </Link>
                  <Link href="/history" className="text-sm hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
                    History
                  </Link>
                </>
              ) : null}
              {/* Subscribers, Delegates, Analytics - Ledger and Delegations */}
              {currentUser.role === 'Subscriber' || currentUser.role === 'Analytics' || currentUser.role === 'Auditor' ? (
                <>
                  <Link href="/ledger" className="text-sm hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
                    Ledger
                  </Link>
                  <Link href="/delegations" className="text-sm hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
                    Delegations
                  </Link>
                </>
              ) : null}
            </div>
          )}
          
          {/* Spacer */}
          <div className="flex-1" />
          
          {/* User Profile - Combined with Persona Switcher */}
          {currentUser && currentOrg && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/20 hover:bg-secondary/30 border border-border/40 hover:border-primary/30 transition-all group shrink-0">
                  {/* Avatar */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-xs border border-primary/20 group-hover:border-primary/40 transition-colors">
                    {getUserInitials(currentUser.name)}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-sm font-medium text-foreground truncate max-w-[140px]">
                      {currentUser.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                      {currentOrg.name}
                    </span>
                  </div>
                  
                  {/* Chevron */}
                  <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Demo Personas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {personas.map(({ user, org }) => (
                  <DropdownMenuItem
                    key={user.id}
                    onClick={() => handlePersonaSwitch(user.id)}
                    className={currentUser?.id === user.id ? 'bg-accent' : ''}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary font-semibold text-xs border border-primary/20">
                        {getUserInitials(user.name)}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium text-sm">{user.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{org.name} • {user.role}</span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  )
}

