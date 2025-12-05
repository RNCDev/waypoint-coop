/**
 * Demo Mode Utilities
 * 
 * Demo mode is enabled when:
 * - NEXT_PUBLIC_DEMO_MODE environment variable is set to 'true'
 * - OR we're in a preview deployment (NEXT_PUBLIC_VERCEL_ENV === 'preview')
 * 
 * This allows unauthenticated access to the app for demo purposes.
 */

/**
 * Check if demo mode is enabled
 */
export function isDemoMode(): boolean {
  if (typeof window === 'undefined') {
    // Server-side: check environment variables
    const isPreview = process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' || 
                      process.env.VERCEL_ENV === 'preview'
    return (
      process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
      isPreview
    )
  } else {
    // Client-side: check environment variables
    // Note: NEXT_PUBLIC_* vars are available at build time, not runtime
    // So we check if we're on a preview URL pattern or use a different approach
    const isPreview = process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ||
                      window.location.hostname.includes('vercel.app')
    return (
      process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
      isPreview
    )
  }
}

/**
 * Get demo mode banner message
 */
export function getDemoModeMessage(): string {
  return 'Demo Mode - This is a preview deployment with sample data'
}
