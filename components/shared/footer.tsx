'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageCircle, Shield, ExternalLink, Sparkles } from 'lucide-react'
import packageJson from '@/package.json'

export function Footer() {
  const [chatOpen, setChatOpen] = useState(false)

  const handleChatClick = () => {
    setChatOpen(true)
    // Placeholder - in production this would open a chat widget
    console.log('Chat activated')
  }

  return (
    <footer className="border-t border-border/50 bg-card/50 mt-auto">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Copyright and Links */}
          <div className="flex flex-col md:flex-row items-center gap-20 text-sm text-muted-foreground font-light">
            <div>
              © {new Date().getFullYear()} Waypoint Cooperative. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/security"
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                Security
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Right: Demo Button, Version and Chat Button */}
          <div className="flex items-center gap-4">
            <Link
              href="/demo/onboarding"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors group"
            >
              <Sparkles className="w-4 h-4 text-amber-400 group-hover:text-amber-300" />
              <span className="text-sm font-medium text-amber-400 group-hover:text-amber-300">Show Onboarding Demo</span>
            </Link>
            <span className="text-xs font-mono text-muted-foreground">v{packageJson.version}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleChatClick}
              className="flex items-center gap-2 font-light border-border/50 hover:bg-secondary/50"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Support</span>
              <span className="sm:hidden">Chat</span>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}

