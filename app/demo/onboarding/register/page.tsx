'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface PersonaData {
  label: string
  organization: {
    name: string
    typeLabel: string
  }
  contact: {
    name: string
    email: string
    title: string
  }
}

export default function DemoRegisterPage() {
  const searchParams = useSearchParams()
  const persona = searchParams.get('persona') || 'lp'
  const [personaData, setPersonaData] = useState<PersonaData | null>(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

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
    <div className="container mx-auto px-4 py-12 max-w-xl">
      <div className="text-center mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
        <p className="text-muted-foreground">
          Register as a {personaData.label}
        </p>
      </div>

      <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
          <CardDescription>
            Basic information to create your Waypoint account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Organization Name */}
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              defaultValue={personaData.organization.name}
              className="bg-secondary/50"
            />
          </div>

          {/* Organization Type */}
          <div className="space-y-2">
            <Label htmlFor="orgType">Organization Type</Label>
            <Input
              id="orgType"
              defaultValue={personaData.organization.typeLabel}
              disabled
              className="bg-secondary/30"
            />
          </div>

          <hr className="border-border/50" />

          {/* Contact Name */}
          <div className="space-y-2">
            <Label htmlFor="contactName">Primary Contact Name</Label>
            <Input
              id="contactName"
              defaultValue={personaData.contact.name}
              className="bg-secondary/50"
            />
          </div>

          {/* Contact Email */}
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Work Email</Label>
            <Input
              id="contactEmail"
              type="email"
              defaultValue={personaData.contact.email}
              className="bg-secondary/50"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              defaultValue="••••••••••••"
              className="bg-secondary/50"
            />
            <p className="text-xs text-muted-foreground">
              Minimum 12 characters with uppercase, lowercase, and numbers
            </p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              defaultValue="••••••••••••"
              className="bg-secondary/50"
            />
          </div>

          <hr className="border-border/50" />

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
              I agree to the{' '}
              <span className="text-primary hover:underline">Terms of Service</span>
              {' '}and{' '}
              <span className="text-primary hover:underline">Privacy Policy</span>.
              I understand that my organization&apos;s data will be processed in accordance with Waypoint&apos;s data protection standards.
            </label>
          </div>

          {/* Submit Button */}
          <Link href={`/demo/onboarding/verify-email?persona=${persona}`}>
            <Button className="w-full" size="lg" disabled={!agreedToTerms}>
              Create Account
            </Button>
          </Link>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <span className="text-primary hover:underline cursor-pointer">Sign in</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

