'use client'

import { Navbar } from '@/components/shared/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Lock, Eye, FileCheck, AlertCircle } from 'lucide-react'

export default function SecurityPage() {
  return (
    <div className="flex-1 bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-semibold mb-3 gradient-text">Security</h1>
          <p className="text-muted-foreground text-base">
            How we protect your data and ensure compliance
          </p>
        </div>

        {/* Security Features */}
        <div className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Encryption
              </CardTitle>
              <CardDescription>
                Data protection in transit and at rest
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground font-light">
                <li>• All data encrypted in transit using TLS 1.3</li>
                <li>• Database encryption at rest with AES-256</li>
                <li>• SHA-256 hashing for data integrity verification</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Access Control
              </CardTitle>
              <CardDescription>
                Relationship-Based Access Control (ReBAC)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground font-light">
                <li>• Granular permission model based on relationships</li>
                <li>• Delegation with approval workflows</li>
                <li>• Immutable audit logs for all actions</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary" />
                Compliance
              </CardTitle>
              <CardDescription>
                Industry standards and certifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground font-light">
                <li>• SOC 2 Type II compliance (in progress)</li>
                <li>• ISO 27001 certification (planned)</li>
                <li>• GDPR and CCPA compliant data handling</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Incident Response
              </CardTitle>
              <CardDescription>
                How we handle security incidents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground font-light">
                <li>• 24/7 security monitoring</li>
                <li>• Automated breach detection and alerts</li>
                <li>• Transparent incident reporting process</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

