/**
 * Application configuration
 * Centralized place for app-wide constants and version info
 * 
 * Usage:
 *   import { APP_VERSION, APP_NAME } from '@/lib/config'
 *   import { appConfig } from '@/lib/config'
 * 
 * The version is read from package.json at build time.
 * For runtime access in server components, you can also use:
 *   process.env.npm_package_version (set by npm during build)
 */

// Read version from package.json
// In Next.js, we can import JSON files directly
import packageJson from '../package.json'

export const APP_VERSION = packageJson.version
export const APP_NAME = packageJson.name

export const appConfig = {
  version: APP_VERSION,
  name: APP_NAME,
  // Add other app-wide config here
  // Example:
  // apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  // features: {
  //   enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  // },
} as const
