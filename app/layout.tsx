import type { Metadata } from 'next'
import { IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Footer } from '@/components/shared/footer'

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
  style: ['normal', 'italic'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Waypoint Cooperative',
  description: 'A secure, immutable message bus for private market data. Built by the industry, for the industry.',
  keywords: ['private equity', 'data exchange', 'fund administration', 'capital calls', 'distributions'],
  authors: [{ name: 'Waypoint Cooperative' }],
  openGraph: {
    title: 'Waypoint Cooperative',
    description: 'Developing private markets data rails',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${ibmPlexSans.variable} ${jetbrainsMono.variable} font-sans font-light antialiased min-h-screen flex flex-col`}
      >
        {children}
        <Footer />
      </body>
    </html>
  )
}

