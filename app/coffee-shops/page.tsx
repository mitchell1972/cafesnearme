import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { generateMetadata as generateSEOMetadata, generateMetaDescription } from '@/lib/seo'
import { CafeCard } from '@/components/CafeCard'
import { SearchBar } from '@/components/SearchBar'
import Link from 'next/link'
import { Coffee, MapPin, Clock, Wifi } from 'lucide-react'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Best Coffee Shops Near Me - Find Local Coffee Spots',
  description: 'Discover the best coffee shops near you. Browse artisan coffee houses, espresso bars, and specialty coffee roasters with real-time information.',
  keywords: [
    'coffee shops near me',
    'best coffee shops',
    'local coffee shops',
    'artisan coffee',
    'espresso bars',
    'coffee roasters',
    'specialty coffee',
  ],
  canonical: '/coffee-shops',
})

export default async function CoffeeShopsPage() {
  // Get top coffee shops
  let topCoffeeShops: any[] = []
  let totalCount = 0
  let cities: any[] = []

  try {
    const results = await Promise.all([
      prisma.cafe.findMany({
        where: {
          OR: [
            { features: { has: 'Specialty Coffee' } },
            { features: { has: 'Artisan Coffee' } },
            { name: { contains: 'Coffee', mode: 'insensitive' } },
          ],
        },
        orderBy: [
          { rating: 'desc' },
          { reviewCount: 'desc' },
        ],
        take: 12,
      }),
      prisma.cafe.count({
        where: {
          OR: [
            { features: { has: 'Specialty Coffee' } },
            { features: { has: 'Artisan Coffee' } },
            { name: { contains: 'Coffee', mode: 'insensitive' } },
          ],
        },
      }),
      prisma.cafe.groupBy({
        by: ['city'],
        where: {
          OR: [
            { features: { has: 'Specialty Coffee' } },
            { features: { has: 'Artisan Coffee' } },
            { name: { contains: 'Coffee', mode: 'insensitive' } },
          ],
        },
        _count: {
          city: true,
        },
        orderBy: {
          _count: {
            city: 'desc',
          },
        },
        take: 6,
      }),
    ])
    
    topCoffeeShops = results[0]
    totalCount = results[1]
    cities = results[2]
  } catch (error) {
    console.log('Unable to fetch coffee shops data - database not available')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              Cafes Near Me
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/search" className="text-gray-600 hover:text-primary">
                Search
              </Link>
              <Link href="/coffee-shops" className="text-primary font-medium">
                Coffee Shops
              </Link>
              <Link href="/breakfast-places" className="text-gray-600 hover:text-primary">
                Breakfast
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-100 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Coffee className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Find the Best Coffee Shops Near You
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Discover {totalCount} amazing coffee shops, from artisan roasters to cozy neighborhood cafes. 
            Find your perfect cup today.
          </p>
          
          <div className="flex justify-center mb-8">
            <SearchBar placeholder="Search for coffee shops..." />
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Coffee className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{totalCount}</p>
              <p className="text-gray-600">Coffee Shops</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{cities.length}</p>
              <p className="text-gray-600">Cities Covered</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">Real-time</p>
              <p className="text-gray-600">Opening Hours</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      {cities.length > 0 && (
        <section className="py-12 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Coffee Shops by City
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {cities.map((city) => (
                <Link
                  key={city.city}
                  href={`/cafes/${city.city.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-semibold">{city.city}</h3>
                  <p className="text-sm text-gray-600">{city._count.city} shops</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Coffee Shops */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Top Rated Coffee Shops
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topCoffeeShops.map((cafe) => (
              <CafeCard key={cafe.id} cafe={cafe} showDistance={false} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/search?features=Specialty Coffee,Artisan Coffee">
              <button className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors">
                View All Coffee Shops
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Find Coffee Shops by Feature
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/search?amenities=WiFi&features=Specialty Coffee" 
              className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <Wifi className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">With WiFi</h3>
              <p className="text-sm text-gray-600">Work-friendly spots</p>
            </Link>
            <Link href="/search?openNow=true&features=Specialty Coffee" 
              className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Open Now</h3>
              <p className="text-sm text-gray-600">Currently serving</p>
            </Link>
            <Link href="/search?features=Organic Coffee" 
              className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <Coffee className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Organic Coffee</h3>
              <p className="text-sm text-gray-600">Sustainable choices</p>
            </Link>
            <Link href="/search?amenities=Outdoor Seating&features=Specialty Coffee" 
              className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Outdoor Seating</h3>
              <p className="text-sm text-gray-600">Al fresco coffee</p>
            </Link>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h2>Discover Amazing Coffee Shops in Your Area</h2>
          <p>
            Whether you're a coffee connoisseur seeking the perfect espresso or someone looking for a 
            cozy spot to work, our comprehensive directory helps you find the best coffee shops near 
            your location. With {totalCount} coffee shops across multiple cities, you're sure to find 
            your new favorite spot.
          </p>
          
          <h3>What Makes a Great Coffee Shop?</h3>
          <p>
            The best coffee shops combine quality coffee with a welcoming atmosphere. Look for shops 
            featuring skilled baristas, ethically sourced beans, and comfortable seating. Many modern 
            coffee shops also offer amenities like free WiFi, power outlets, and quiet spaces perfect 
            for remote work or studying.
          </p>
          
          <h3>Types of Coffee Shops</h3>
          <ul>
            <li><strong>Specialty Coffee Roasters</strong> - Focus on single-origin beans and precise brewing methods</li>
            <li><strong>Espresso Bars</strong> - Quick service with expertly crafted espresso drinks</li>
            <li><strong>Third Wave Coffee Shops</strong> - Emphasize coffee origin, processing, and brewing techniques</li>
            <li><strong>Neighborhood Cafes</strong> - Community-focused spots with a local feel</li>
            <li><strong>Coffee Chains</strong> - Consistent quality and familiar menu options</li>
          </ul>
          
          <h3>Find Your Perfect Coffee Experience</h3>
          <p>
            Use our search filters to find coffee shops that match your preferences. Filter by opening 
            hours to find early morning options or late-night study spots. Look for shops with WiFi 
            for productive work sessions, or discover pet-friendly cafes where you can bring your 
            furry friend. Real-time information ensures you always know which shops are open now.
          </p>
        </div>
      </section>
    </div>
  )
}
