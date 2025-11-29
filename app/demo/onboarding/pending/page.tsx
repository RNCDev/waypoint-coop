'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ReviewStage {
  name: string
  status: 'completed' | 'in_progress' | 'pending'
  completedAt: string | null
}

interface ReviewTimeline {
  submitted: string
  estimatedCompletion: string
  stages: ReviewStage[]
}

interface PersonaData {
  organization: {
    name: string
  }
  contact: {
    email: string
  }
}

interface DemoData {
  reviewTimeline: ReviewTimeline
  personas: Record<string, PersonaData>
}

export default function DemoPendingPage() {
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

  const personaData = demoData.personas[persona]
  const timeline = demoData.reviewTimeline
  const completedStages = timeline.stages.filter(s => s.status === 'completed').length

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-8 animate-slide-up">
        <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">
          Verification In Progress
        </h1>
        <p className="text-muted-foreground">
          Your submission is being reviewed by our compliance team
        </p>
      </div>

      {/* Status Card */}
      <Card className="mb-6 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Organization</p>
              <p className="font-semibold">{personaData.organization.name}</p>
            </div>
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
              Under Review
            </Badge>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border/50">
            <div>
              <p className="text-sm text-muted-foreground">Submitted</p>
              <p className="font-mono text-sm">
                {new Date(timeline.submitted).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated Completion</p>
              <p className="font-mono text-sm">
                {new Date(timeline.estimatedCompletion).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Progress */}
      <Card className="mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Review Progress</CardTitle>
            <span className="text-sm text-muted-foreground">
              {completedStages}/{timeline.stages.length} completed
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeline.stages.map((stage, index) => (
              <div key={stage.name} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${stage.status === 'completed' ? 'bg-green-500 text-white' : ''}
                    ${stage.status === 'in_progress' ? 'bg-yellow-500 text-white' : ''}
                    ${stage.status === 'pending' ? 'bg-secondary text-muted-foreground' : ''}
                  `}>
                    {stage.status === 'completed' ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : stage.status === 'in_progress' ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <span className="text-sm">{index + 1}</span>
                    )}
                  </div>
                  {index < timeline.stages.length - 1 && (
                    <div className={`
                      w-0.5 h-8 mt-2
                      ${stage.status === 'completed' ? 'bg-green-500' : 'bg-border'}
                    `} />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className={`font-medium ${stage.status === 'pending' ? 'text-muted-foreground' : ''}`}>
                    {stage.name}
                  </p>
                  {stage.status === 'completed' && stage.completedAt && (
                    <p className="text-xs text-green-400">
                      Completed {new Date(stage.completedAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                  {stage.status === 'in_progress' && (
                    <p className="text-xs text-yellow-400">In progress...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Info */}
      <Card className="mb-8 bg-secondary/30 border-border/50 animate-slide-up" style={{ animationDelay: '150ms' }}>
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <div className="text-sm">
              <p className="font-medium mb-1">We&apos;ll notify you when complete</p>
              <p className="text-muted-foreground">
                You&apos;ll receive an email at <span className="text-primary">{personaData.contact.email}</span> once 
                your verification is approved. Most reviews are completed within 1-2 business days.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo: Skip to Approved */}
      <div className="text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
        <p className="text-xs text-muted-foreground mb-4">
          Demo Mode: Click below to simulate approval
        </p>
        <Link href={`/demo/onboarding/approved?persona=${persona}`}>
          <Button variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Skip to Approved (Demo)
          </Button>
        </Link>
      </div>
    </div>
  )
}

