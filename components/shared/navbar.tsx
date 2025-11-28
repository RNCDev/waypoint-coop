'use client'

import Link from 'next/link'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

export function Navbar() {
  const { currentUser, currentOrg, personas, setPersona } = useAuthStore()

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-primary">
              Waypoint
            </Link>
            {currentUser && (
              <div className="flex items-center gap-4">
                {currentUser.role === 'Publisher' || currentUser.role === 'Asset Owner' ? (
                  <>
                    <Link href="/composer" className="text-sm hover:text-primary">
                      Composer
                    </Link>
                    <Link href="/history" className="text-sm hover:text-primary">
                      History
                    </Link>
                  </>
                ) : null}
                {currentUser.role === 'Subscriber' || currentUser.role === 'Analytics' || currentUser.role === 'Auditor' ? (
                  <>
                    <Link href="/ledger" className="text-sm hover:text-primary">
                      Ledger
                    </Link>
                    <Link href="/delegations" className="text-sm hover:text-primary">
                      Delegations
                    </Link>
                  </>
                ) : null}
                {currentUser.role === 'Publisher' && currentOrg?.name === 'Genii Admin Services' ? (
                  <>
                    <Link href="/registry" className="text-sm hover:text-primary">
                      Registry
                    </Link>
                    <Link href="/audit" className="text-sm hover:text-primary">
                      Audit
                    </Link>
                  </>
                ) : null}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {currentUser && currentOrg && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">{currentOrg.name}</Badge>
                <span className="text-sm text-muted-foreground">{currentUser.name}</span>
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Switch Persona
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Demo Personas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {personas.map(({ user, org }) => (
                  <DropdownMenuItem
                    key={user.id}
                    onClick={() => setPersona(user.id)}
                    className={currentUser?.id === user.id ? 'bg-accent' : ''}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{org.name} • {user.role}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}

