import { SearchBar } from '@/components/SearchBar'
import { CafeCard } from '@/components/CafeCard'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Coffee, MapPin, Clock, Wifi } from 'lucide-react'

export default async function HomePage() {
  // Get featured cafes for the home page
  let featuredCafes = []
  let popularCities = []
  
  try {
    featuredCafes = await prisma.cafe.findMany({
      take: 6,
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' },
      ],
      where: {
        rating: { gte: 4 },
      },
    })

    // Get popular cities for SEO
    popularCities = await prisma.cafe.groupBy({
      by: ['city'],
      _count: {
        city: true,
      },
      orderBy: {
        _count: {
          city: 'desc',
        },
      },
      take: 8,
    })
  } catch (error) {
    console.log('Unable to fetch data - database not available')
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 to-orange-100 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Find the Best Cafes Near You
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Discover amazing coffee shops and cafes in your area. Search by location, browse amenities, and find your perfect spot.
          </p>
          
          <div className="flex justify-center mb-8">
            <SearchBar placeholder="Enter postcode, area, or cafe name..." />
          </div>
          
          {/* Quick filters */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/search?openNow=true">
              <Button variant="outline" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Open Now
              </Button>
            </Link>
            <Link href="/search?amenities=WiFi">
              <Button variant="outline" className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                With WiFi
              </Button>
            </Link>
            <Link href="/coffee-shops">
              <Button variant="outline" className="flex items-center gap-2">
                <Coffee className="h-4 w-4" />
                Coffee Shops
              </Button>
            </Link>
            <Link href="/breakfast-places">
              <Button variant="outline">
                Breakfast Places
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Cafes */}
      {featuredCafes.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Top Rated Cafes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCafes.map((cafe) => (
                <CafeCard key={cafe.id} cafe={cafe} showDistance={false} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/search">
                <Button size="lg">
                  View All Cafes
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Popular Locations */}
      {popularCities.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Popular Locations
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularCities.map((city) => (
                <Link
                  key={city.city}
                  href={`/cafes/${city.city.toLowerCase().replace(/\s+/g, '-')}`}
                  className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">{city.city}</h3>
                  <p className="text-sm text-gray-600">{city._count.city} cafes</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SEO Content */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h2>Find the Perfect Cafe Near You</h2>
          <p>
            Whether you're looking for a cozy spot to work, a place to meet friends, or just need your morning coffee fix, 
            our comprehensive directory helps you discover the best cafes and coffee shops in your area.
          </p>
          
          <h3>Search by Location</h3>
          <p>
            Use our advanced search to find cafes near your current location or search by postcode, city, or area. 
            Get real-time information about opening hours, see which cafes are open now, and find the perfect spot 
            that meets your needs.
          </p>
          
          <h3>Browse by Features</h3>
          <p>
            Looking for cafes with WiFi for remote work? Need a place with outdoor seating? Want to find dog-friendly 
            coffee shops? Our detailed filters help you find exactly what you're looking for, from amenities to 
            dietary options.
          </p>
          
          <h3>Discover Local Favorites</h3>
          <p>
            Explore top-rated cafes in your area, read reviews from other coffee lovers, and save your favorite spots 
            for quick access. Whether you prefer artisan coffee shops, traditional cafes, or trendy brunch spots, 
            we've got you covered.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold text-lg mb-4">Cafes Near Me</h4>
              <p className="text-gray-400">
                Your go-to directory for finding the best cafes and coffee shops in your area.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/search" className="hover:text-white">Search Cafes</Link></li>
                <li><Link href="/coffee-shops" className="hover:text-white">Coffee Shops</Link></li>
                <li><Link href="/breakfast-places" className="hover:text-white">Breakfast Places</Link></li>
                <li><Link href="/brunch-spots" className="hover:text-white">Brunch Spots</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/open-now" className="hover:text-white">Open Now</Link></li>
                <li><Link href="/with-wifi" className="hover:text-white">WiFi Available</Link></li>
                <li><Link href="/organic-coffee" className="hover:text-white">Organic Coffee</Link></li>
                <li><Link href="/24-hour-cafes" className="hover:text-white">24 Hour Cafes</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Popular Cities</h4>
              <ul className="space-y-2 text-gray-400">
                {popularCities.slice(0, 5).map((city) => (
                  <li key={city.city}>
                    <Link 
                      href={`/cafes/${city.city.toLowerCase().replace(/\s+/g, '-')}`}
                      className="hover:text-white"
                    >
                      Cafes in {city.city}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Cafes Near Me. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
