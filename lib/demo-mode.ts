/**
 * Demo Mode Utilities
 * 
 * Demo mode is enabled when:
 * - NEXT_PUBLIC_DEMO_MODE environment variable is set to 'true'
 * - AND we're in a preview deployment (NEXT_PUBLIC_VERCEL_ENV === 'preview')
 * 
 * This allows unauthenticated access to the app for demo purposes.
 */

/**
 * Check if demo mode is enabled
 */
export function isDemoMode(): boolean {
  if (typeof window === 'undefined') {
    // Server-side: check environment variables
    return (
      process.env.NEXT_PUBLIC_DEMO_MODE === 'true' &&
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
    )
  } else {
    // Client-side: check window environment
    return (
      process.env.NEXT_PUBLIC_DEMO_MODE === 'true' &&
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
    )
  }
}

/**
 * Get demo mode banner message
 */
export function getDemoModeMessage(): string {
  return 'Demo Mode - This is a preview deployment with sample data'
}
