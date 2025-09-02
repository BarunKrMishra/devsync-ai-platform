import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DevSync - From Requirement to Integration in Days',
  description: 'AI Requirement Translator + Universal API Connector. Define. Generate. Integrate.',
  keywords: ['AI', 'API', 'Integration', 'Code Generation', 'Requirements', 'DevOps'],
  authors: [{ name: 'DevSync Team' }],
  openGraph: {
    title: 'DevSync - From Requirement to Integration in Days',
    description: 'AI Requirement Translator + Universal API Connector',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevSync - From Requirement to Integration in Days',
    description: 'AI Requirement Translator + Universal API Connector',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
