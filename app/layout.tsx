import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { generateMetadata as generateSEOMetadata, generateSearchActionStructuredData } from '@/lib/seo'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = generateSEOMetadata({
  title: 'Cafes Near Me - Find the Best Local Coffee Shops',
  description: 'Find the best cafes and coffee shops near you. Browse local coffee spots with WiFi, outdoor seating, and more. Open now with real-time information.',
  keywords: [
    'cafes near me',
    'coffee shops near me',
    'best cafes nearby',
    'local coffee shops',
    'cafes open now',
    'coffee near me',
    'breakfast cafes',
    'brunch spots',
  ],
  openGraph: {
    title: 'Cafes Near Me - Find the Best Local Coffee Shops',
    description: 'Discover amazing cafes and coffee shops in your area with detailed information, opening hours, and amenities.',
    images: ['/og-image.jpg'],
  },
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const searchActionSchema = generateSearchActionStructuredData()

  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ea580c" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Cafes Near Me" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(searchActionSchema),
          }}
        />
      </head>
      <body className={`${inter.className} h-full`}>
        {children}
      </body>
    </html>
  )
}
