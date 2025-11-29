'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { PersonaSwitcher } from './persona-switcher'
import { cn } from '@/lib/utils'

export function Navbar() {
  const pathname = usePathname()
  const { navItems } = useAuthStore()

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-light text-foreground hover:text-primary transition-colors">
              Waypoint
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navItems.slice(1).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3 py-2 text-sm font-light rounded-md transition-colors',
                    'hover:text-primary',
                    pathname === item.href
                      ? 'text-primary font-normal'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side - Persona Switcher */}
          <div className="flex items-center">
            <PersonaSwitcher />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3 -mt-1">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin pb-1">
            {navItems.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-1.5 text-sm font-light rounded-md transition-colors whitespace-nowrap',
                  'hover:text-primary',
                  pathname === item.href
                    ? 'text-primary font-normal'
                    : 'text-muted-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

