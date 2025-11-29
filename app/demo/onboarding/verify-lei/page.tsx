'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LEIResult {
  valid: boolean
  status: string
  legalName: string
  jurisdiction: string
  registrationDate: string
  lastUpdateDate: string
  managingLou: string
}

interface PersonaData {
  organization: {
    name: string
    lei: string
    leiLookupResult: LEIResult
  }
}

function VerifyLEIContent() {
  const searchParams = useSearchParams()
  const persona = searchParams.get('persona') || 'lp'
  const [personaData, setPersonaData] = useState<PersonaData | null>(null)
  const [leiValue, setLeiValue] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<LEIResult | null>(null)

  useEffect(() => {
    fetch('/demo-data.json')
      .then(res => res.json())
      .then(data => {
        const p = data.personas[persona]
        if (p) {
          setPersonaData(p)
          setLeiValue(p.organization.lei)
        }
      })
      .catch(console.error)
  }, [persona])

  const handleValidate = () => {
    if (!personaData) return
    setIsValidating(true)
    // Simulate validation delay
    setTimeout(() => {
      setValidationResult(personaData.organization.leiLookupResult)
      setIsValidating(false)
    }, 1500)
  }

  if (!personaData) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold mb-2">
          LEI Verification
        </h1>
        <p className="text-muted-foreground">
          Enter your Legal Entity Identifier to verify your organization
        </p>
      </div>

      <Card className="mb-6 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <CardHeader>
          <CardTitle>Legal Entity Identifier (LEI)</CardTitle>
          <CardDescription>
            Your 20-character ISO 17442 identifier will be validated against the GLEIF registry
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="lei">LEI Number</Label>
            <div className="flex gap-2">
              <Input
                id="lei"
                value={leiValue}
                onChange={(e) => setLeiValue(e.target.value.toUpperCase())}
                placeholder="Enter your 20-character LEI"
                className="font-mono text-lg tracking-wider"
                maxLength={20}
              />
              <Button
                onClick={handleValidate}
                disabled={leiValue.length !== 20 || isValidating}
                variant="secondary"
              >
                {isValidating ? (
                  <>
                    <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Validating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Validate
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {leiValue.length}/20 characters
            </p>
          </div>

          {/* Validation Result */}
          {validationResult && (
            <div className="animate-scale-in">
              {validationResult.valid ? (
                <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-green-400">LEI Validated</p>
                      <p className="text-xs text-muted-foreground">Verified via GLEIF Registry</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Legal Name</span>
                      <span className="font-medium">{validationResult.legalName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Jurisdiction</span>
                      <span className="font-mono">{validationResult.jurisdiction}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className="text-green-400 font-medium">{validationResult.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Registration Date</span>
                      <span className="font-mono text-xs">{validationResult.registrationDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span className="font-mono text-xs">{validationResult.lastUpdateDate}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <p className="font-semibold text-red-400">LEI Not Found</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    The entered LEI was not found in the GLEIF registry. Please check the number and try again.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="mb-8 bg-secondary/30 border-border/50 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm">
              <p className="font-medium mb-1">Don&apos;t have an LEI?</p>
              <p className="text-muted-foreground">
                LEIs can be obtained from any accredited Local Operating Unit (LOU). 
                Visit <span className="text-primary">gleif.org</span> to find an issuer in your region.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between animate-slide-up" style={{ animationDelay: '150ms' }}>
        <Link href={`/demo/onboarding/verify-start?persona=${persona}`}>
          <Button variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
        </Link>
        <Link href={`/demo/onboarding/verify-org?persona=${persona}`}>
          <Button size="lg" disabled={!validationResult?.valid}>
            Continue
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function DemoVerifyLEIPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center"><div className="animate-pulse">Loading...</div></div>}>
      <VerifyLEIContent />
    </Suspense>
  )
}
