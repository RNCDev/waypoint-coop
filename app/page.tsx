'use client'

import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  const { currentUser, currentOrg } = useAuthStore()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Waypoint</h1>
          <p className="text-xl text-muted-foreground mb-8">
            The Digital Clearinghouse for Private Market Data
          </p>
          {currentUser && currentOrg && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
              <span className="text-sm">Logged in as</span>
              <span className="font-semibold">{currentUser.name}</span>
              <span className="text-muted-foreground">•</span>
              <span>{currentOrg.name}</span>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(currentUser?.role === 'Publisher' || currentUser?.role === 'Asset Owner') && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Composer</CardTitle>
                  <CardDescription>Create and publish data packets</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/composer">
                    <Button className="w-full">
                      Open Composer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>History</CardTitle>
                  <CardDescription>View published envelopes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/history">
                    <Button className="w-full" variant="outline">
                      View History
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </>
          )}

          {(currentUser?.role === 'Subscriber' || currentUser?.role === 'Analytics' || currentUser?.role === 'Auditor') && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Ledger</CardTitle>
                  <CardDescription>View your data feed</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/ledger">
                    <Button className="w-full">
                      Open Ledger
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Delegations</CardTitle>
                  <CardDescription>Manage delegate access</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/delegations">
                    <Button className="w-full" variant="outline">
                      Manage Delegations
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </>
          )}

          {currentUser?.role === 'Publisher' && currentOrg?.name === 'Genii Admin Services' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Entity Registry</CardTitle>
                  <CardDescription>Manage organizations and users</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/registry">
                    <Button className="w-full" variant="outline">
                      Open Registry
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Global Audit</CardTitle>
                  <CardDescription>View system-wide audit log</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/audit">
                    <Button className="w-full" variant="outline">
                      View Audit
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

