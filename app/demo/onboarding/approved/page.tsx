'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import confetti from 'canvas-confetti'

interface PersonaData {
  label: string
  organization: {
    name: string
    shortName: string
  }
  contact: {
    name: string
  }
  dashboardStats: Record<string, number>
  subscriptions?: Array<{ fundName: string; commitment: string }>
  gpClients?: Array<{ gpName: string; fundsManaged: number }>
}

function ApprovedContent() {
  const searchParams = useSearchParams()
  const persona = searchParams.get('persona') || 'lp'
  const [personaData, setPersonaData] = useState<PersonaData | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    fetch('/demo-data.json')
      .then(res => res.json())
      .then(data => {
        const p = data.personas[persona]
        if (p) setPersonaData(p)
      })
      .catch(console.error)
  }, [persona])

  useEffect(() => {
    if (!showConfetti && personaData) {
      setShowConfetti(true)
      // Fire confetti
      const duration = 2000
      const end = Date.now() + duration

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#3b82f6', '#22c55e', '#eab308'],
        })
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#3b82f6', '#22c55e', '#eab308'],
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      frame()
    }
  }, [showConfetti, personaData])

  if (!personaData) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  const isLP = persona === 'lp'

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10 animate-scale-in">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 mb-4">
          Tier 1: Identity Verified
        </Badge>
        <h1 className="text-4xl font-bold mb-3 gradient-text">
          Congratulations!
        </h1>
        <p className="text-xl text-muted-foreground">
          {personaData.organization.name} is now verified on Waypoint
        </p>
      </div>

      {/* What's Unlocked */}
      <Card className="mb-8 border-green-500/30 bg-green-500/5 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            Features Now Unlocked
          </CardTitle>
          <CardDescription>
            Full platform access is now available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {isLP ? (
              <>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="font-medium">Data Feeds</p>
                    <p className="text-sm text-muted-foreground">Receive capital calls & distributions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="font-medium">Subscriptions</p>
                    <p className="text-sm text-muted-foreground">Manage fund relationships</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="font-medium">Access Delegation</p>
                    <p className="text-sm text-muted-foreground">Share data with consultants</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="font-medium">API Access</p>
                    <p className="text-sm text-muted-foreground">Integrate with your systems</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="font-medium">Publishing</p>
                    <p className="text-sm text-muted-foreground">Publish capital calls & reports</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="font-medium">GP Client Management</p>
                    <p className="text-sm text-muted-foreground">Manage GP relationships</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="font-medium">Access Grants</p>
                    <p className="text-sm text-muted-foreground">Manage delegated permissions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="font-medium">Full API Access</p>
                    <p className="text-sm text-muted-foreground">Read and write capabilities</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Preview */}
      <Card className="mb-8 animate-slide-up" style={{ animationDelay: '150ms' }}>
        <CardHeader>
          <CardTitle>Your Dashboard Preview</CardTitle>
          <CardDescription>
            Here&apos;s what&apos;s waiting for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            {isLP ? (
              <>
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-3xl font-bold text-primary">{personaData.dashboardStats.pendingEnvelopes}</p>
                  <p className="text-sm text-muted-foreground">Pending Items</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-3xl font-bold text-primary">{personaData.dashboardStats.activeSubscriptions}</p>
                  <p className="text-sm text-muted-foreground">Subscriptions</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-3xl font-bold text-primary">{personaData.dashboardStats.pendingAccessRequests}</p>
                  <p className="text-sm text-muted-foreground">Access Requests</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-3xl font-bold text-primary">{personaData.dashboardStats.fundsAdministered}</p>
                  <p className="text-sm text-muted-foreground">Funds Managed</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-3xl font-bold text-primary">{personaData.dashboardStats.pendingCapitalCalls}</p>
                  <p className="text-sm text-muted-foreground">Pending Calls</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-3xl font-bold text-primary">{personaData.dashboardStats.lpRecordsManaged}</p>
                  <p className="text-sm text-muted-foreground">LP Records</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <CardTitle>Recommended Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">1</div>
              <div className="flex-1">
                <p className="font-medium">
                  {isLP ? 'Review your active subscriptions' : 'Connect with your GP clients'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isLP ? 'Confirm your fund relationships are up to date' : 'Set up publishing permissions for each GP'}
                </p>
              </div>
              <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">2</div>
              <div className="flex-1">
                <p className="font-medium">
                  {isLP ? 'Set up consultant access' : 'Invite team members'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isLP ? 'Delegate data access to your advisors' : 'Add users who will publish on behalf of GPs'}
                </p>
              </div>
              <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">3</div>
              <div className="flex-1">
                <p className="font-medium">Configure API integration</p>
                <p className="text-sm text-muted-foreground">
                  Connect Waypoint to your existing systems
                </p>
              </div>
              <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center animate-slide-up" style={{ animationDelay: '250ms' }}>
        <Link href="/">
          <Button size="lg">
            Go to Dashboard
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </Link>
        <p className="text-sm text-muted-foreground mt-4">
          Welcome to the Waypoint network, {personaData.contact.name}!
        </p>
      </div>
    </div>
  )
}

export default function DemoApprovedPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center"><div className="animate-pulse">Loading...</div></div>}>
      <ApprovedContent />
    </Suspense>
  )
}
