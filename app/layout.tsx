import type { Metadata } from 'next'
import { IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const ibmPlexSans = IBM_Plex_Sans({ 
  subsets: ['latin'],
  weight: ['300'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Waypoint - Private Market Data Clearinghouse',
  description: 'Secure, immutable message bus for private market data',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${ibmPlexSans.variable} ${jetbrainsMono.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}

