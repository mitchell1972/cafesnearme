import { Suspense } from 'react'
import { SearchResults } from './SearchResults'
import { SearchBar } from '@/components/SearchBar'
import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Search Cafes Near You | Find Local Coffee Shops',
  description: 'Search for cafes and coffee shops near your location. Filter by amenities, opening hours, and distance. Find your perfect coffee spot today.',
  keywords: ['search cafes', 'find coffee shops', 'cafes near me search', 'local cafe finder'],
})

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="text-2xl font-bold text-primary">
              Cafes Near Me
            </a>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Cafes</h1>
          <SearchBar />
        </div>
      </section>

      {/* Results Section */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <Suspense fallback={<div>Loading...</div>}>
          <SearchResults />
        </Suspense>
      </section>
    </div>
  )
}
