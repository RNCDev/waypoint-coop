'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface PersonaData {
  contact: {
    email: string
  }
}

export default function DemoVerifyEmailPage() {
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

  return (
    <div className="container mx-auto px-4 py-16 max-w-xl">
      <Card className="text-center animate-scale-in">
        <CardHeader className="pb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription className="text-base">
            We&apos;ve sent a verification link to confirm your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Sent to:</p>
            <p className="font-mono text-primary">{personaData.contact.email}</p>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Click the link in the email to verify your account.</p>
            <p>The link will expire in 24 hours.</p>
          </div>

          {/* Demo: Skip verification */}
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-4">
              Demo Mode: Click below to simulate email verification
            </p>
            <Link href={`/demo/onboarding/dashboard-t0?persona=${persona}`}>
              <Button variant="outline" className="w-full">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Verify Email (Demo)
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the email?{' '}
            <span className="text-primary hover:underline cursor-pointer">Resend</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

