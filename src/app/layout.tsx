import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TimerProvider } from '@/components/TimerProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { PowerSyncProvider } from '@/components/PowerSyncProvider'
import { UserMenu } from '@/components/UserMenu'
import { StudyChat } from '@/components/StudyChat'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'PrepNet — CCNA Exam Prep',
  description: 'PrepNet helps you prepare for the CCNA exam. Interactive lessons, hands-on labs, practice tests, and progress tracking — all in one place.',
  keywords: ['CCNA', 'exam preparation', 'PrepNet', 'interactive learning', 'networking', 'Cisco', 'study tools'],
  authors: [{ name: 'PrepNet' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
                     bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
        >
          Skip to main content
        </a>

        <AuthProvider>
          <PowerSyncProvider>
            <TimerProvider>
              <div className="min-h-screen bg-gray-50">
                {children}
              </div>
              <UserMenu />
              <StudyChat />
            </TimerProvider>
          </PowerSyncProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
