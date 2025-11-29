'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface BeneficialOwner {
  id: string
  name: string
  role: string
  ownershipPercentage: number
  controlType: string
  citizenship: string
  idDocumentType: string
  idDocumentCountry: string
  verified: boolean
}

interface PersonaData {
  beneficialOwners: BeneficialOwner[]
  organization: {
    entityType: string
  }
}

export default function DemoVerifyUBOPage() {
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

  const isPension = personaData.organization.entityType === 'PENSION'

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold mb-2">
          Beneficial Ownership
        </h1>
        <p className="text-muted-foreground">
          {isPension 
            ? 'Identify senior officers with control over the entity'
            : 'Identify individuals with 25% or greater ownership or control'
          }
        </p>
      </div>

      {/* Info Card */}
      <Card className="mb-6 bg-primary/5 border-primary/20 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm">
              <p className="font-medium mb-1">Why do we collect this?</p>
              <p className="text-muted-foreground">
                {isPension 
                  ? 'As a pension fund, we need to identify senior officers with significant control, per FinCEN requirements for public entities.'
                  : 'Under the Corporate Transparency Act and FinCEN Customer Due Diligence rules, we must identify individuals who own or control 25% or more of your organization.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* UBO List */}
      <Card className="mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Beneficial Owners</CardTitle>
              <CardDescription>
                {personaData.beneficialOwners.length} {personaData.beneficialOwners.length === 1 ? 'person' : 'people'} identified
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Person
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {personaData.beneficialOwners.map((owner, index) => (
              <div
                key={owner.id}
                className="p-4 rounded-lg border border-border/50 hover:border-border transition-colors"
                style={{ animationDelay: `${150 + index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-semibold">
                      {owner.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium">{owner.name}</p>
                      <p className="text-sm text-muted-foreground">{owner.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {owner.verified ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Control Type</p>
                    <p className="font-medium capitalize">{owner.controlType.toLowerCase().replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Ownership</p>
                    <p className="font-medium">
                      {owner.ownershipPercentage > 0 ? `${owner.ownershipPercentage}%` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Citizenship</p>
                    <p className="font-medium">{owner.citizenship}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">ID Type</p>
                    <p className="font-medium capitalize">{owner.idDocumentType.toLowerCase().replace('_', ' ')}</p>
                  </div>
                </div>

                {owner.verified && (
                  <div className="mt-3 pt-3 border-t border-border/30 flex items-center gap-2 text-xs text-green-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Identity verified via government ID
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Total Ownership */}
      <Card className="mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Disclosed Ownership</p>
              <p className="text-2xl font-bold">
                {personaData.beneficialOwners.reduce((sum, o) => sum + o.ownershipPercentage, 0)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Verification Status</p>
              <p className="text-lg font-semibold text-green-400">
                {personaData.beneficialOwners.filter(o => o.verified).length}/{personaData.beneficialOwners.length} Verified
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between animate-slide-up" style={{ animationDelay: '250ms' }}>
        <Link href={`/demo/onboarding/verify-org?persona=${persona}`}>
          <Button variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
        </Link>
        <Link href={`/demo/onboarding/verify-docs?persona=${persona}`}>
          <Button size="lg">
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

