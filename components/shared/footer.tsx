'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageCircle, Shield, ExternalLink, Sparkles, X } from 'lucide-react'
import packageJson from '@/package.json'
import { motion, AnimatePresence } from 'framer-motion'

export function Footer() {
  const [chatOpen, setChatOpen] = useState(false)

  const handleChatClick = () => {
    setChatOpen(true)
  }

  return (
    <>
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

      {/* Easter Egg Chat Widget */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
          >
            <div 
              className="relative rounded-xl border border-white/10 shadow-2xl overflow-hidden"
              style={{
                background: 'rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              }}
            >
              {/* Subtle gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none" />
              
              {/* Chat Header */}
              <div 
                className="relative flex items-center justify-between p-4 border-b border-white/10"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center ring-2 ring-primary/20">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Waypoint Support</h3>
                    <p className="text-xs text-muted-foreground">We're here to help</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChatOpen(false)}
                  className="h-7 w-7 p-0 hover:bg-white/10 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Chat Messages */}
              <div className="relative p-5 space-y-4 max-h-96 overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex gap-3"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 ring-1 ring-primary/10">
                    <MessageCircle className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div 
                      className="rounded-2xl p-4 text-sm leading-relaxed shadow-lg"
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <p className="text-foreground">
                        Hi. It looks like you are interested in learning more about Waypoint. Our deck is here:{' '}
                        <a
                          href="https://docs.google.com/presentation/d/1JiqpIuICF9MA7LskmJH1dXUNPJ9S7gdWIPEq0xiHBxw/edit?usp=drive_link"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1.5 transition-colors underline decoration-primary/50 underline-offset-2"
                        >
                          Waypoint Deck
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 ml-2 font-medium">
                      {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

