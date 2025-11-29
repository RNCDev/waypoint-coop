'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface RequiredDocument {
  type: string
  label: string
  description: string
  status: 'uploaded' | 'pending' | 'rejected'
  fileName?: string
  uploadedAt?: string
}

interface PersonaData {
  requiredDocuments: RequiredDocument[]
  organization: {
    name: string
  }
}

function VerifyDocsContent() {
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

  const uploadedCount = personaData.requiredDocuments.filter(d => d.status === 'uploaded').length
  const totalCount = personaData.requiredDocuments.length

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold mb-2">
          Document Upload
        </h1>
        <p className="text-muted-foreground">
          Upload required documentation to verify your organization
        </p>
      </div>

      {/* Progress */}
      <Card className="mb-6 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Upload Progress</p>
            <p className="text-sm font-medium">{uploadedCount}/{totalCount} documents</p>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${(uploadedCount / totalCount) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <Card className="mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
          <CardDescription>
            Click on a document type to upload
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {personaData.requiredDocuments.map((doc, index) => (
              <div
                key={doc.type}
                className={`
                  p-4 rounded-lg border transition-all cursor-pointer
                  ${doc.status === 'uploaded' 
                    ? 'border-green-500/30 bg-green-500/5' 
                    : 'border-border/50 hover:border-primary/50 hover:bg-secondary/30'
                  }
                `}
                style={{ animationDelay: `${150 + index * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                      ${doc.status === 'uploaded' ? 'bg-green-500/20' : 'bg-secondary'}
                    `}>
                      {doc.status === 'uploaded' ? (
                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{doc.label}</p>
                      <p className="text-sm text-muted-foreground">{doc.description}</p>
                      {doc.status === 'uploaded' && doc.fileName && (
                        <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          {doc.fileName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    {doc.status === 'uploaded' ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                        Uploaded
                      </Badge>
                    ) : (
                      <Button variant="outline" size="sm">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload Guidelines */}
      <Card className="mb-8 bg-secondary/30 border-border/50 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardContent className="py-4">
          <h4 className="font-medium mb-3">Document Guidelines</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              PDF, JPG, or PNG format (max 10MB per file)
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Documents must be dated within the last 12 months
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              All text must be clearly legible
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Documents are encrypted and stored securely
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between animate-slide-up" style={{ animationDelay: '250ms' }}>
        <Link href={`/demo/onboarding/verify-ubo?persona=${persona}`}>
          <Button variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
        </Link>
        <Link href={`/demo/onboarding/verify-review?persona=${persona}`}>
          <Button size="lg" disabled={uploadedCount < totalCount}>
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

export default function DemoVerifyDocsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center"><div className="animate-pulse">Loading...</div></div>}>
      <VerifyDocsContent />
    </Suspense>
  )
}
