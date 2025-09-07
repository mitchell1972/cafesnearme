import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { generateMetadata as generateSEOMetadata, generateMetaDescription, generateBreadcrumbStructuredData } from '@/lib/seo'
import { CafeCard } from '@/components/CafeCard'
import { SearchBar } from '@/components/SearchBar'
import Link from 'next/link'

interface PageProps {
  params: { city: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const cityName = params.city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  let cafeCount = 0
  try {
    cafeCount = await prisma.cafe.count({
      where: {
        city: {
          equals: cityName,
          mode: 'insensitive',
        },
      },
    })
  } catch (error) {
    console.log('Unable to fetch cafe count - database not available')
  }

  const description = generateMetaDescription('city', {
    city: cityName,
    count: cafeCount,
  })

  return generateSEOMetadata({
    title: `Cafes in ${cityName} - ${cafeCount ? `${cafeCount} ` : ''}Coffee Shops | Cafes Near Me`,
    description,
    keywords: [
      `cafes in ${cityName}`,
      `coffee shops ${cityName}`,
      `best cafes ${cityName}`,
      `${cityName} coffee`,
      `breakfast ${cityName}`,
      `brunch ${cityName}`,
    ],
    canonical: `/cafes/${params.city}`,
  })
}

export async function generateStaticParams() {
  try {
    const cities = await prisma.cafe.groupBy({
      by: ['city'],
      _count: {
        city: true,
      },
      orderBy: {
        _count: {
          city: 'desc',
        },
      },
      take: 50, // Pre-generate pages for top 50 cities
    })

    return cities.map((city) => ({
      city: city.city.toLowerCase().replace(/\s+/g, '-'),
    }))
  } catch (error) {
    console.log('Unable to generate static params - database not available during build')
    // Return empty array to skip static generation when database is not available
    return []
  }
}

export default async function CityPage({ params }: PageProps) {
  const cityName = params.city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  let cafes: any[] = []
  let areas: any[] = []
  let totalCount = 0

  try {
    const results = await Promise.all([
      prisma.cafe.findMany({
        where: {
          city: {
            equals: cityName,
            mode: 'insensitive',
          },
        },
        orderBy: [
          { rating: 'desc' },
          { reviewCount: 'desc' },
        ],
        take: 24,
      }),
      prisma.cafe.groupBy({
        by: ['area'],
        where: {
          city: {
            equals: cityName,
            mode: 'insensitive',
          },
          area: {
            not: null,
          },
        },
        _count: {
          area: true,
        },
        orderBy: {
          _count: {
            area: 'desc',
          },
        },
      }),
      prisma.cafe.count({
        where: {
          city: {
            equals: cityName,
            mode: 'insensitive',
          },
        },
      }),
    ])

    cafes = results[0]
    areas = results[1]
    totalCount = results[2]
  } catch (error) {
    console.log('Unable to fetch city data - database not available')
  }

  if (cafes.length === 0 && totalCount === 0) {
    // Only show not found if we're sure there's no data (not just a database error)
    // For now, show the page with empty data
  }

  const breadcrumbStructuredData = generateBreadcrumbStructuredData([
    { name: 'Home', url: '/' },
    { name: cityName, url: `/cafes/${params.city}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />

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
                <Link href="/coffee-shops" className="text-gray-600 hover:text-primary">
                  Coffee Shops
                </Link>
                <Link href="/breakfast-places" className="text-gray-600 hover:text-primary">
                  Breakfast
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <nav className="max-w-7xl mx-auto px-4 py-3">
          <ol className="flex items-center gap-2 text-sm text-gray-600">
            <li><Link href="/" className="hover:text-primary">Home</Link></li>
            <li>/</li>
            <li className="text-gray-900">{cityName}</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-orange-50 to-orange-100 py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Cafes in {cityName}
            </h1>
            <p className="text-xl text-gray-700 mb-6">
              Discover {totalCount} amazing cafes and coffee shops in {cityName}
            </p>
            <div className="flex justify-center">
              <SearchBar placeholder={`Search cafes in ${cityName}...`} />
            </div>
          </div>
        </section>

        {/* Areas Section */}
        {areas.length > 0 && (
          <section className="py-8 px-4 bg-white border-b">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-semibold mb-4">Popular Areas in {cityName}</h2>
              <div className="flex flex-wrap gap-3">
                {areas.map((area) => (
                  <Link
                    key={area.area}
                    href={`/cafes/${params.city}/${area.area?.toLowerCase().replace(/\s+/g, '-')}`}
                    className="bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-sm transition-colors"
                  >
                    {area.area} ({area._count.area})
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Cafes Grid */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Top Cafes in {cityName}
              </h2>
              <p className="text-gray-600 mt-2">
                Showing {cafes.length} of {totalCount} cafes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cafes.map((cafe) => (
                <CafeCard key={cafe.id} cafe={cafe} showDistance={false} />
              ))}
            </div>

            {totalCount > cafes.length && (
              <div className="text-center mt-8">
                <Link href={`/search?q=${cityName}`}>
                  <button className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors">
                    View All {totalCount} Cafes
                  </button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-12 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h2>Discover the Best Cafes in {cityName}</h2>
            <p>
              {cityName} is home to {totalCount} exceptional cafes and coffee shops, each offering 
              unique experiences for coffee lovers and food enthusiasts. Whether you're a local 
              resident or visiting the area, our comprehensive guide helps you find the perfect 
              spot for your morning coffee, business meetings, or casual catch-ups with friends.
            </p>
            
            <h3>Coffee Culture in {cityName}</h3>
            <p>
              From artisanal roasters to cozy neighborhood cafes, {cityName}'s coffee scene has 
              something for everyone. Many cafes feature locally roasted beans, skilled baristas, 
              and welcoming atmospheres that make them perfect for work, relaxation, or socializing.
            </p>
            
            {areas.length > 0 && (
              <>
                <h3>Popular Cafe Areas</h3>
                <p>
                  {cityName} boasts diverse neighborhoods, each with its own cafe culture. 
                  {areas[0].area} leads with {areas[0]._count.area} cafes, followed by other 
                  vibrant areas like {areas.slice(1, 3).map(a => a.area).join(' and ')}. 
                  Each neighborhood offers unique cafe experiences worth exploring.
                </p>
              </>
            )}
            
            <h3>Find Your Perfect Cafe</h3>
            <p>
              Use our search filters to find cafes with specific amenities like WiFi for remote work, 
              outdoor seating for sunny days, or late-night hours for evening study sessions. 
              Check real-time opening hours and read reviews from fellow coffee enthusiasts to 
              make informed choices.
            </p>
          </div>
        </section>
      </div>
    </>
  )
}
