import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { generateMetadata as generateSEOMetadata, generateMetaDescription, generateBreadcrumbStructuredData } from '@/lib/seo'
import { CafeCard } from '@/components/CafeCard'
import { SearchBar } from '@/components/SearchBar'
import Link from 'next/link'

interface PageProps {
  params: { 
    city: string
    area: string 
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const cityName = params.city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  const areaName = params.area.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  let cafeCount = 0
  try {
    cafeCount = await prisma.cafe.count({
      where: {
        city: {
          equals: cityName,
          mode: 'insensitive',
        },
        area: {
          equals: areaName,
          mode: 'insensitive',
        },
      },
    })
  } catch (error) {
    console.log('Unable to fetch cafe count - database not available')
  }

  const description = generateMetaDescription('area', {
    area: areaName,
    city: cityName,
    count: cafeCount,
  })

  return generateSEOMetadata({
    title: `Cafes in ${areaName}, ${cityName} - ${cafeCount ? `${cafeCount} ` : ''}Coffee Shops | Cafes Near Me`,
    description,
    keywords: [
      `cafes in ${areaName}`,
      `coffee shops ${areaName}`,
      `${areaName} ${cityName} cafes`,
      `best cafes ${areaName}`,
      `${areaName} coffee`,
      `breakfast ${areaName}`,
    ],
    canonical: `/cafes/${params.city}/${params.area}`,
  })
}

// Dynamic rendering for area pages
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateStaticParams() {
  // Skip static generation for area pages - they will be rendered dynamically
  return []
}

export default async function AreaPage({ params }: PageProps) {
  const cityName = params.city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  const areaName = params.area.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  let cafes: any[] = []
  let totalCount = 0
  let nearbyAreas: any[] = []

  try {
    const results = await Promise.all([
      prisma.cafe.findMany({
        where: {
          city: {
            equals: cityName,
            mode: 'insensitive',
          },
          area: {
            equals: areaName,
            mode: 'insensitive',
          },
        },
        orderBy: [
          { rating: 'desc' },
          { reviewCount: 'desc' },
        ],
        take: 24,
      }),
      prisma.cafe.count({
        where: {
          city: {
            equals: cityName,
            mode: 'insensitive',
          },
          area: {
            equals: areaName,
            mode: 'insensitive',
          },
        },
      }),
      // Get other areas in the same city
      prisma.cafe.groupBy({
        by: ['area'],
        where: {
          city: {
            equals: cityName,
            mode: 'insensitive',
          },
          AND: [
            {
              area: {
                not: null,
              },
            },
            {
              NOT: {
                area: {
                  equals: areaName,
                  mode: 'insensitive',
                },
              },
            },
          ],
        },
        _count: {
          area: true,
        },
        orderBy: {
          _count: {
            area: 'desc',
          },
        },
        take: 10,
      }),
    ])

    cafes = results[0]
    totalCount = results[1]
    nearbyAreas = results[2]
  } catch (error) {
    console.log('Unable to fetch area data - database not available')
  }

  if (cafes.length === 0 && totalCount === 0) {
    // Only show not found if we're sure there's no data (not just a database error)
    // For now, show the page with empty data
  }

  const breadcrumbStructuredData = generateBreadcrumbStructuredData([
    { name: 'Home', url: '/' },
    { name: cityName, url: `/cafes/${params.city}` },
    { name: areaName, url: `/cafes/${params.city}/${params.area}` },
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
            <li><Link href={`/cafes/${params.city}`} className="hover:text-primary">{cityName}</Link></li>
            <li>/</li>
            <li className="text-gray-900">{areaName}</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-orange-50 to-orange-100 py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Cafes in {areaName}, {cityName}
            </h1>
            <p className="text-xl text-gray-700 mb-6">
              Discover {totalCount} amazing cafes and coffee shops in {areaName}
            </p>
            <div className="flex justify-center">
              <SearchBar placeholder={`Search cafes in ${areaName}...`} />
            </div>
          </div>
        </section>

        {/* Nearby Areas Section */}
        {nearbyAreas.length > 0 && (
          <section className="py-8 px-4 bg-white border-b">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-semibold mb-4">Other Areas in {cityName}</h2>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/cafes/${params.city}`}
                  className="bg-primary/10 hover:bg-primary/20 rounded-full px-4 py-2 text-sm transition-colors"
                >
                  All {cityName} Cafes
                </Link>
                {nearbyAreas.map((area) => (
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
                Top Cafes in {areaName}
              </h2>
              <p className="text-gray-600 mt-2">
                Showing {cafes.length} of {totalCount} cafes
              </p>
            </div>

            {cafes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cafes.map((cafe) => (
                  <CafeCard key={cafe.id} cafe={cafe} showDistance={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">
                  No cafes found in {areaName}, {cityName}
                </p>
                <Link href={`/cafes/${params.city}`}>
                  <button className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors">
                    View All {cityName} Cafes
                  </button>
                </Link>
              </div>
            )}

            {totalCount > cafes.length && cafes.length > 0 && (
              <div className="text-center mt-8">
                <Link href={`/search?q=${areaName}+${cityName}`}>
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
            <h2>Discover the Best Cafes in {areaName}</h2>
            <p>
              {areaName} is a vibrant area in {cityName} with {totalCount} exceptional cafes and coffee shops. 
              Whether you're a local resident or exploring the neighborhood, our comprehensive guide helps you 
              find the perfect spot for your coffee needs.
            </p>
            
            <h3>Coffee Culture in {areaName}</h3>
            <p>
              The cafes in {areaName} offer diverse experiences, from quick coffee stops to leisurely brunch spots. 
              Many feature locally roasted beans, skilled baristas, and welcoming atmospheres perfect for any occasion.
            </p>
            
            {nearbyAreas.length > 0 && (
              <>
                <h3>Explore Nearby Areas</h3>
                <p>
                  While {areaName} has great cafes, don't miss exploring nearby areas in {cityName}. 
                  {nearbyAreas.slice(0, 3).map(a => a.area).join(', ')} also offer excellent coffee 
                  experiences worth discovering.
                </p>
              </>
            )}
            
            <h3>Find Your Perfect Cafe in {areaName}</h3>
            <p>
              Use our search filters to find cafes with specific amenities like WiFi for remote work, 
              outdoor seating for sunny days, or late-night hours for evening study sessions. 
              Check real-time opening hours and read reviews to make informed choices.
            </p>
          </div>
        </section>
      </div>
    </>
  )
}
