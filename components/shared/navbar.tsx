'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { PersonaSwitcher } from './persona-switcher'
import { cn } from '@/lib/utils'
import { Home, ChevronDown, ChevronUp } from 'lucide-react'

export function Navbar() {
  const pathname = usePathname()
  const { navItems } = useAuthStore()
  const [isPersonaStripOpen, setIsPersonaStripOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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

            {/* Right Side - Logo */}
            <div className="flex items-center">
              <div className="h-80 w-32 overflow-hidden relative flex items-center justify-center">
                <div className="scale-[1.75] origin-center -translate-x-0 translate-y-14">
                  <Image 
                    src="/waypoint-logo.svg" 
                    alt="Waypoint" 
                    width={81}
                    height={100}
                    className="h-[100px] w-auto opacity-50"
                    priority
                  />
                </div>
              </div>
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

      {/* Secondary Header - Demo Controls */}
      {isMounted && (
        <div className="sticky top-20 z-40 border-b border-border/40 bg-secondary/30 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <button
              onClick={() => setIsPersonaStripOpen(!isPersonaStripOpen)}
              className="w-full flex items-center justify-between px-4 py-2 hover:bg-secondary/50 transition-colors"
            >
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                Demo Controls
              </span>
              {isPersonaStripOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            
            {isPersonaStripOpen && (
              <div className="px-4 pb-3 pt-2 bg-secondary/20">
                <div className="flex items-center gap-3">
                  <PersonaSwitcher />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
