'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const VERIFICATION_STEPS = [
  { id: 'lei', path: '/demo/onboarding/verify-lei', label: 'LEI' },
  { id: 'org', path: '/demo/onboarding/verify-org', label: 'Organization' },
  { id: 'ubo', path: '/demo/onboarding/verify-ubo', label: 'Ownership' },
  { id: 'docs', path: '/demo/onboarding/verify-docs', label: 'Documents' },
  { id: 'review', path: '/demo/onboarding/verify-review', label: 'Review' },
]

// Pages that show the verification stepper
const VERIFICATION_PAGES = [
  '/demo/onboarding/verify-lei',
  '/demo/onboarding/verify-org',
  '/demo/onboarding/verify-ubo',
  '/demo/onboarding/verify-docs',
  '/demo/onboarding/verify-review',
]

export default function DemoOnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const showStepper = VERIFICATION_PAGES.includes(pathname)
  
  const getCurrentStepIndex = () => {
    const index = VERIFICATION_STEPS.findIndex(step => step.path === pathname)
    return index >= 0 ? index : -1
  }
  
  const currentStepIndex = getCurrentStepIndex()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/demo/onboarding" className="flex items-center gap-3">
            <Image
              src="/waypoint-logo.svg"
              alt="Waypoint"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-lg font-semibold">Waypoint</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Onboarding Demo
            </span>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Exit Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Progress Stepper - Only show during verification flow */}
      {showStepper && (
        <div className="border-b border-border/40 bg-card/30">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-center gap-2">
              {VERIFICATION_STEPS.map((step, index) => {
                const isCompleted = index < currentStepIndex
                const isCurrent = index === currentStepIndex
                const isPending = index > currentStepIndex
                
                return (
                  <div key={step.id} className="flex items-center">
                    {/* Step indicator */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                          ${isCompleted ? 'bg-green-500 text-white' : ''}
                          ${isCurrent ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' : ''}
                          ${isPending ? 'bg-secondary text-muted-foreground' : ''}
                        `}
                      >
                        {isCompleted ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className={`
                        text-xs mt-1 hidden sm:block
                        ${isCurrent ? 'text-primary font-medium' : 'text-muted-foreground'}
                      `}>
                        {step.label}
                      </span>
                    </div>
                    
                    {/* Connector line */}
                    {index < VERIFICATION_STEPS.length - 1 && (
                      <div
                        className={`
                          w-12 h-0.5 mx-2
                          ${index < currentStepIndex ? 'bg-green-500' : 'bg-border'}
                        `}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-border/40 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Waypoint Cooperative Demo • Not for production use</p>
        </div>
      </footer>
    </div>
  )
}

