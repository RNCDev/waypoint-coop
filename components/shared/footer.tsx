'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageCircle, Shield, ExternalLink } from 'lucide-react'

export function Footer() {
  const [chatOpen, setChatOpen] = useState(false)

  const handleChatClick = () => {
    setChatOpen(true)
    // Placeholder - in production this would open a chat widget
    console.log('Chat activated')
  }

  return (
    <footer className="border-t border-border/50 bg-card/50 mt-auto">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Copyright and Links */}
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground font-light">
            <div>
              © {new Date().getFullYear()} Waypoint Cooperative. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/security"
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                Security
                <ExternalLink className="w-3 h-3" />
              </Link>
              <span className="text-xs font-mono">v0.2.4</span>
            </div>
          </div>

          {/* Right: Chat Button */}
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
    </footer>
  )
}

