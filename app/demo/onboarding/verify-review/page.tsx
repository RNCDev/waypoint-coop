'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

interface PersonaData {
  organization: {
    name: string
    lei: string
    ein: string
    entityType: string
    formationJurisdiction: string
    address: {
      city: string
      state: string
      country: string
    }
  }
  beneficialOwners: Array<{ name: string; role: string; verified: boolean }>
  requiredDocuments: Array<{ label: string; status: string }>
}

export default function DemoVerifyReviewPage() {
  const searchParams = useSearchParams()
  const persona = searchParams.get('persona') || 'lp'
  const [personaData, setPersonaData] = useState<PersonaData | null>(null)
  const [attestations, setAttestations] = useState({
    accuracy: false,
    authorized: false,
    terms: false,
  })

  useEffect(() => {
    fetch('/demo-data.json')
      .then(res => res.json())
      .then(data => {
        const p = data.personas[persona]
        if (p) setPersonaData(p)
      })
      .catch(console.error)
  }, [persona])

  const allAttested = attestations.accuracy && attestations.authorized && attestations.terms

  if (!personaData) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  const org = personaData.organization

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold mb-2">
          Review & Submit
        </h1>
        <p className="text-muted-foreground">
          Confirm your information before submitting for verification
        </p>
      </div>

      {/* Organization Summary */}
      <Card className="mb-6 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Organization Details</CardTitle>
            <Link href={`/demo/onboarding/verify-org?persona=${persona}`} className="text-sm text-primary hover:underline">
              Edit
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Legal Name</p>
              <p className="font-medium">{org.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">LEI</p>
              <p className="font-mono text-xs">{org.lei}</p>
            </div>
            <div>
              <p className="text-muted-foreground">EIN</p>
              <p className="font-mono">{org.ein}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Entity Type</p>
              <p className="font-medium">{org.entityType}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Jurisdiction</p>
              <p className="font-medium">{org.formationJurisdiction}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Location</p>
              <p className="font-medium">{org.address.city}, {org.address.state}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Beneficial Owners Summary */}
      <Card className="mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Beneficial Owners</CardTitle>
            <Link href={`/demo/onboarding/verify-ubo?persona=${persona}`} className="text-sm text-primary hover:underline">
              Edit
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {personaData.beneficialOwners.map((owner) => (
              <div key={owner.name} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold">
                    {owner.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{owner.name}</p>
                    <p className="text-xs text-muted-foreground">{owner.role}</p>
                  </div>
                </div>
                {owner.verified && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                    Verified
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documents Summary */}
      <Card className="mb-6 animate-slide-up" style={{ animationDelay: '150ms' }}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Documents</CardTitle>
            <Link href={`/demo/onboarding/verify-docs?persona=${persona}`} className="text-sm text-primary hover:underline">
              Edit
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {personaData.requiredDocuments.map((doc) => (
              <Badge
                key={doc.label}
                variant="outline"
                className={doc.status === 'uploaded' ? 'bg-green-500/10 text-green-400 border-green-500/30' : ''}
              >
                {doc.status === 'uploaded' && (
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {doc.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attestations */}
      <Card className="mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <CardTitle>Attestations</CardTitle>
          <CardDescription>
            Please review and confirm the following statements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="accuracy"
              checked={attestations.accuracy}
              onCheckedChange={(checked) => setAttestations({ ...attestations, accuracy: checked as boolean })}
            />
            <label htmlFor="accuracy" className="text-sm leading-relaxed cursor-pointer">
              I certify that all information provided is <span className="font-semibold">accurate and complete</span> to the best of my knowledge.
            </label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="authorized"
              checked={attestations.authorized}
              onCheckedChange={(checked) => setAttestations({ ...attestations, authorized: checked as boolean })}
            />
            <label htmlFor="authorized" className="text-sm leading-relaxed cursor-pointer">
              I am <span className="font-semibold">authorized to submit</span> this verification request on behalf of {org.name}.
            </label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={attestations.terms}
              onCheckedChange={(checked) => setAttestations({ ...attestations, terms: checked as boolean })}
            />
            <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
              I agree to the <span className="text-primary hover:underline">Waypoint Platform Agreement</span> and consent to identity verification in accordance with the <span className="text-primary hover:underline">Privacy Policy</span>.
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between animate-slide-up" style={{ animationDelay: '250ms' }}>
        <Link href={`/demo/onboarding/verify-docs?persona=${persona}`}>
          <Button variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
        </Link>
        <Link href={`/demo/onboarding/pending?persona=${persona}`}>
          <Button size="lg" disabled={!allAttested}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Submit for Verification
          </Button>
        </Link>
      </div>
    </div>
  )
}

