'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PersonaData {
  label: string
  organization: {
    name: string
    shortName: string
    typeLabel: string
  }
  contact: {
    name: string
    title: string
  }
  dashboardStats: Record<string, number>
  subscriptions?: Array<{ fundName: string; gpName: string; commitment: string }>
  gpClients?: Array<{ gpName: string; fundsManaged: number; aum: string }>
}

export default function DemoDashboardT0Page() {
  const searchParams = useSearchParams()
  const persona = searchParams.get('persona') || 'lp'
  const [personaData, setPersonaData] = useState<PersonaData | null>(null)

  useEffect(() => {
    fetch('/demo-data.json')
      .then(res => res.json())
      .then(data => {
        const p = data.personas[persona]
        if (p) setPersonaData(p)
      })
      .catch(console.error)
  }, [persona])

  if (!personaData) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  const isLP = persona === 'lp'

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Welcome Header */}
      <div className="mb-6 animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {personaData.contact.name}
            </h1>
            <p className="text-muted-foreground">
              {personaData.contact.title} at {personaData.organization.name}
            </p>
          </div>
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
            Tier 0: Registered
          </Badge>
        </div>
      </div>

      {/* Verification Banner */}
      <Card className="mb-8 border-amber-500/50 bg-amber-500/5 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-amber-400 mb-1">
                Verification Required
              </h3>
              <p className="text-muted-foreground mb-4">
                Your organization is registered but not yet verified. Complete verification to unlock full platform access including:
              </p>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
                {isLP ? (
                  <>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      View capital calls & distributions
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Access fund performance data
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Delegate access to consultants
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      API access for data integration
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Publish capital calls & distributions
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Manage GP client relationships
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Access grant management
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Full API access
                    </li>
                  </>
                )}
              </ul>
              <Link href={`/demo/onboarding/verify-start?persona=${persona}`}>
                <Button size="lg">
                  Start Verification
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Locked Feature Cards */}
        <Card className="opacity-60 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                {isLP ? 'Data Feeds' : 'Publishing'}
              </CardTitle>
              <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-muted-foreground">Locked</p>
            <p className="text-sm text-muted-foreground">
              {isLP ? 'Requires verification' : 'Requires verification'}
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-60 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                {isLP ? 'Subscriptions' : 'GP Clients'}
              </CardTitle>
              <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-muted-foreground">Locked</p>
            <p className="text-sm text-muted-foreground">
              {isLP ? 'Requires verification' : 'Requires verification'}
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-60 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Access Grants</CardTitle>
              <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-muted-foreground">Locked</p>
            <p className="text-sm text-muted-foreground">Requires verification</p>
          </CardContent>
        </Card>
      </div>

      {/* Organization Profile (Available) */}
      <Card className="animate-slide-up" style={{ animationDelay: '250ms' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Organization Profile</CardTitle>
              <CardDescription>
                Basic profile information (available at Tier 0)
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
              Available
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Organization Name</p>
              <p className="font-medium">{personaData.organization.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium">{personaData.organization.typeLabel}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Primary Contact</p>
              <p className="font-medium">{personaData.contact.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Title</p>
              <p className="font-medium">{personaData.contact.title}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

