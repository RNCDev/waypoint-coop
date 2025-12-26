'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { PersonaSwitcher } from './persona-switcher'
import { ThemeToggle } from './theme-toggle'
import { cn } from '@/lib/utils'
import { Home } from 'lucide-react'

export function Navbar() {
  const pathname = usePathname()
  const { navItems } = useAuthStore()

  return (
    <>
      {/* Main Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            {/* Left Side - Home Icon */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                <Home className="w-6 h-6 text-primary" />
              </Link>
              <div className="hidden md:flex items-center gap-1">
                {navItems.slice(1).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'px-3 py-2 text-sm font-normal rounded-md transition-colors uppercase tracking-wide',
                      'hover:text-primary',
                      pathname === item.href
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Side - Theme Toggle & Persona Switcher */}
            <div className="flex items-center justify-end gap-2">
              <ThemeToggle />
              <PersonaSwitcher />
              {/* Logo hidden for demo
              <div className="h-80 w-32 overflow-hidden relative flex items-center justify-center">
                <div className="scale-[1.25] origin-center -translate-x-0 translate-y-8">
                  <Image 
                    src="/images/waypoint-logo.svg" 
                    alt="Waypoint" 
                    width={81}
                    height={100}
                    className="h-[100px] w-auto opacity-50"
                    priority
                  />
                </div>
              </div>
              */}
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
                    'px-3 py-1.5 text-sm font-bold rounded-md transition-colors whitespace-nowrap uppercase tracking-wide',
                    'hover:text-primary',
                    pathname === item.href
                      ? 'text-primary'
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
    </>
  )
}
