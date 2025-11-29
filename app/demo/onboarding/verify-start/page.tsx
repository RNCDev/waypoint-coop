'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface VerificationStep {
  id: string
  number: number
  title: string
  description: string
}

interface PersonaData {
  organization: {
    name: string
  }
  requiredDocuments: Array<{ type: string; label: string }>
}

interface DemoData {
  verificationSteps: VerificationStep[]
  personas: Record<string, PersonaData>
}

function VerifyStartContent() {
  const searchParams = useSearchParams()
  const persona = searchParams.get('persona') || 'lp'
  const [demoData, setDemoData] = useState<DemoData | null>(null)

  useEffect(() => {
    fetch('/demo-data.json')
      .then(res => res.json())
      .then(data => setDemoData(data))
      .catch(console.error)
  }, [])

  if (!demoData) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  const steps = demoData.verificationSteps

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10 animate-slide-up">
        <h1 className="text-3xl font-bold mb-2 gradient-text">
          Identity Verification
        </h1>
        <p className="text-lg text-muted-foreground">
          Complete verification to unlock full platform access
        </p>
      </div>

      <Card className="mb-8 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <CardHeader>
          <CardTitle>What You&apos;ll Need</CardTitle>
          <CardDescription>
            Gather these items before starting the verification process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-sm">Legal Entity Identifier (LEI)</p>
                <p className="text-xs text-muted-foreground">20-character ISO 17442 identifier</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-sm">EIN / Tax ID</p>
                <p className="text-xs text-muted-foreground">Federal tax identification number</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-sm">Formation Documents</p>
                <p className="text-xs text-muted-foreground">Certificate of formation, good standing</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-sm">Beneficial Owner Info</p>
                <p className="text-xs text-muted-foreground">Details for owners with &gt;25% control</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle>Verification Steps</CardTitle>
          <CardDescription>
            The process typically takes 10-15 minutes to complete
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-border/50 hover:border-border transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-semibold text-muted-foreground">
                  {step.number}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                <div className="text-muted-foreground">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between animate-slide-up" style={{ animationDelay: '150ms' }}>
        <Link href={`/demo/onboarding/dashboard-t0?persona=${persona}`}>
          <Button variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Button>
        </Link>
        <Link href={`/demo/onboarding/verify-lei?persona=${persona}`}>
          <Button size="lg">
            Begin Verification
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function DemoVerifyStartPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center"><div className="animate-pulse">Loading...</div></div>}>
      <VerifyStartContent />
    </Suspense>
  )
}
