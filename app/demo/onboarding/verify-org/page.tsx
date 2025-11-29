'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface PersonaData {
  organization: {
    name: string
    legalName?: string
    lei: string
    ein: string
    entityType: string
    formationJurisdiction: string
    formationDate: string
    address: {
      street1: string
      street2: string
      city: string
      state: string
      postalCode: string
      country: string
    }
    registeredAgent: {
      name: string
      address: string
    }
  }
}

function VerifyOrgContent() {
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

  const org = personaData.organization

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold mb-2">
          Organization Details
        </h1>
        <p className="text-muted-foreground">
          Confirm your entity information
        </p>
      </div>

      <Card className="mb-6 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <CardHeader>
          <CardTitle>Entity Information</CardTitle>
          <CardDescription>
            This information was pre-filled from your LEI registration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Legal Name */}
          <div className="space-y-2">
            <Label htmlFor="legalName">Legal Entity Name</Label>
            <Input
              id="legalName"
              defaultValue={org.name}
              className="bg-secondary/50"
            />
          </div>

          {/* LEI - Read only */}
          <div className="space-y-2">
            <Label htmlFor="lei">LEI Number</Label>
            <div className="flex items-center gap-2">
              <Input
                id="lei"
                defaultValue={org.lei}
                disabled
                className="font-mono bg-secondary/30"
              />
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Verified
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* EIN */}
            <div className="space-y-2">
              <Label htmlFor="ein">EIN / Tax ID</Label>
              <Input
                id="ein"
                defaultValue={org.ein}
                className="font-mono bg-secondary/50"
              />
            </div>

            {/* Entity Type */}
            <div className="space-y-2">
              <Label htmlFor="entityType">Entity Type</Label>
              <Select defaultValue={org.entityType}>
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LLC">LLC</SelectItem>
                  <SelectItem value="LP">Limited Partnership</SelectItem>
                  <SelectItem value="LLP">LLP</SelectItem>
                  <SelectItem value="CORPORATION">Corporation</SelectItem>
                  <SelectItem value="PENSION">Pension Fund</SelectItem>
                  <SelectItem value="TRUST">Trust</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Formation Jurisdiction */}
            <div className="space-y-2">
              <Label htmlFor="jurisdiction">Formation Jurisdiction</Label>
              <Input
                id="jurisdiction"
                defaultValue={org.formationJurisdiction}
                className="font-mono bg-secondary/50"
              />
            </div>

            {/* Formation Date */}
            <div className="space-y-2">
              <Label htmlFor="formationDate">Formation Date</Label>
              <Input
                id="formationDate"
                type="date"
                defaultValue={org.formationDate}
                className="bg-secondary/50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle>Principal Business Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street1">Street Address</Label>
            <Input
              id="street1"
              defaultValue={org.address.street1}
              className="bg-secondary/50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="street2">Address Line 2</Label>
            <Input
              id="street2"
              defaultValue={org.address.street2}
              placeholder="Suite, Floor, etc."
              className="bg-secondary/50"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                defaultValue={org.address.city}
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                defaultValue={org.address.state}
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                defaultValue={org.address.postalCode}
                className="bg-secondary/50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8 animate-slide-up" style={{ animationDelay: '150ms' }}>
        <CardHeader>
          <CardTitle>Registered Agent</CardTitle>
          <CardDescription>
            Your registered agent for service of process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agentName">Agent Name</Label>
            <Input
              id="agentName"
              defaultValue={org.registeredAgent.name}
              className="bg-secondary/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="agentAddress">Agent Address</Label>
            <Input
              id="agentAddress"
              defaultValue={org.registeredAgent.address}
              className="bg-secondary/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between animate-slide-up" style={{ animationDelay: '200ms' }}>
        <Link href={`/demo/onboarding/verify-lei?persona=${persona}`}>
          <Button variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
        </Link>
        <Link href={`/demo/onboarding/verify-ubo?persona=${persona}`}>
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

export default function DemoVerifyOrgPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center"><div className="animate-pulse">Loading...</div></div>}>
      <VerifyOrgContent />
    </Suspense>
  )
}
