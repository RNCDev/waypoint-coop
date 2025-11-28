'use client'

import Link from 'next/link'
import { APP_VERSION } from '@/lib/config'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-14">
          {/* Left: Copyright */}
          <div className="text-xs text-muted-foreground">
            © {currentYear} Waypoint Coop. All rights reserved.
          </div>

          {/* Center: Security & Contact Links */}
          <div className="flex items-center gap-4 text-xs">
            <Link 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Security & Compliance
            </Link>
            <span className="text-border/40">•</span>
            <Link 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-border/40">•</span>
            <Link 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Contact Support
            </Link>
          </div>

          {/* Right: Version & Chat */}
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground font-mono">
              v{APP_VERSION}
            </div>
            <div className="h-4 w-px bg-border/40" />
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="h-7 px-2 text-xs text-muted-foreground opacity-50 cursor-not-allowed"
              title="Chat support coming soon"
            >
              <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
              Chat
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}

