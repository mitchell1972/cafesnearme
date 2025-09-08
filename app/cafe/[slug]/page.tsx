import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { generateMetadata as generateSEOMetadata, generateCafeStructuredData, generateBreadcrumbStructuredData, generateMetaDescription } from '@/lib/seo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Phone, Globe, Mail, Clock, Wifi, Car, Trees, Heart, Share2, ExternalLink, Star } from 'lucide-react'
import { formatOpeningHours, isOpenNow, getTodayHours } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const cafe = await prisma.cafe.findUnique({
      where: { slug: params.slug },
    })

    if (!cafe) return {}

    const description = generateMetaDescription('cafe', {
      name: cafe.name,
      city: cafe.city,
      address: cafe.address,
      description: cafe.description,
      amenities: cafe.amenities,
    })

    return generateSEOMetadata({
      title: `${cafe.name} - ${cafe.city} | Cafes Near Me`,
      description: cafe.metaDescription || description,
      keywords: [
        cafe.name,
        `${cafe.name} ${cafe.city}`,
        `cafe ${cafe.postcode}`,
        `coffee shop ${cafe.area || cafe.city}`,
        ...(cafe.amenities || []),
      ],
      openGraph: {
        title: cafe.name,
        description: cafe.metaDescription || description,
        images: cafe.images?.length > 0 ? cafe.images : cafe.thumbnail ? [cafe.thumbnail] : [],
      },
      canonical: `/cafe/${cafe.slug}`,
    })
  } catch (error) {
    console.log('Unable to fetch cafe metadata - database not available')
    return {}
  }
}

// Dynamic rendering for cafe pages
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateStaticParams() {
  // Skip static generation for cafe pages - they will be rendered dynamically
  return []
}

export default async function CafePage({ params }: PageProps) {
  let cafe: any = null
  
  try {
    cafe = await prisma.cafe.findUnique({
      where: { slug: params.slug },
      include: {
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            reviews: true,
            favorites: true,
          },
        },
      },
    })
  } catch (error) {
    console.log('Unable to fetch cafe data - database not available')
    // Return a minimal page instead of throwing error
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">Unable to load cafe data</h1>
          <p>Please check back later or contact support if the issue persists.</p>
        </div>
      </div>
    )
  }

  if (!cafe) {
    notFound()
  }

  const isOpen = isOpenNow(cafe.openingHours)
  const todayHours = getTodayHours(cafe.openingHours)
  
  const cafeStructuredData = generateCafeStructuredData(cafe)
  const breadcrumbStructuredData = generateBreadcrumbStructuredData([
    { name: 'Home', url: '/' },
    { name: cafe.city, url: `/cafes/${cafe.city.toLowerCase().replace(/\s+/g, '-')}` },
    { name: cafe.name, url: `/cafe/${cafe.slug}` },
  ])

  const amenityIcons: Record<string, React.ReactNode> = {
    WiFi: <Wifi className="h-5 w-5" />,
    Parking: <Car className="h-5 w-5" />,
    'Outdoor Seating': <Trees className="h-5 w-5" />,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(cafeStructuredData),
        }}
      />
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
            <li><Link href={`/cafes/${cafe.city.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-primary">{cafe.city}</Link></li>
            <li>/</li>
            <li className="text-gray-900">{cafe.name}</li>
          </ol>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                {cafe.images && cafe.images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
                    {cafe.images.slice(0, 4).map((image: string, index: number) => (
                      <div key={index} className="relative h-64">
                        <Image
                          src={image}
                          alt={`${cafe.name} - Image ${index + 1}`}
                          fill
                          className="object-cover rounded"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    ))}
                  </div>
                ) : cafe.thumbnail ? (
                  <div className="relative h-96">
                    <Image
                      src={cafe.thumbnail}
                      alt={cafe.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                  </div>
                ) : (
                  <div className="h-96 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                    <span className="text-6xl">☕</span>
                  </div>
                )}
              </div>

              {/* Cafe Details */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-3xl">{cafe.name}</CardTitle>
                      <CardDescription className="text-lg mt-2">
                        <MapPin className="inline h-4 w-4 mr-1" />
                        {cafe.address}, {cafe.city} {cafe.postcode}
                      </CardDescription>
                    </div>
                    <div className={`rounded-full px-4 py-2 text-sm font-medium ${
                      isOpen === null
                        ? 'bg-gray-100 text-gray-600'
                        : isOpen
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isOpen === null ? 'Hours not available' : isOpen ? 'Open Now' : 'Closed'}
                    </div>
                  </div>

                  {/* Rating */}
                  {cafe.rating && (
                    <div className="flex items-center gap-2 mt-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(cafe.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{cafe.rating.toFixed(1)}</span>
                      <span className="text-gray-600">({cafe.reviewCount} reviews)</span>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Description */}
                  {cafe.description && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">About</h3>
                      <p className="text-gray-600">{cafe.description}</p>
                    </div>
                  )}

                  {/* Amenities */}
                  {cafe.amenities && cafe.amenities.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Amenities</h3>
                      <div className="flex flex-wrap gap-3">
                        {cafe.amenities.map((amenity: string) => (
                          <div
                            key={amenity}
                            className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2"
                          >
                            {amenityIcons[amenity] || <span className="h-5 w-5">✓</span>}
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  {cafe.features && cafe.features.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {cafe.features.map((feature: string) => (
                          <span
                            key={feature}
                            className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Opening Hours */}
                  {cafe.openingHours && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Opening Hours</h3>
                      <div className="space-y-2">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                          const hours = typeof cafe.openingHours === 'object' && cafe.openingHours !== null 
                            ? (cafe.openingHours as Record<string, any>)[day]
                            : null
                          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
                          const currentDay = dayNames[new Date().getDay()].toLowerCase()
                          const isToday = currentDay === day
                          return (
                            <div
                              key={day}
                              className={`flex justify-between py-1 ${isToday ? 'font-semibold' : ''}`}
                            >
                              <span className="capitalize">{day}</span>
                              <span>{hours ? formatOpeningHours(hours) : 'Closed'}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reviews Section */}
              {cafe.reviews && cafe.reviews.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cafe.reviews.map((review: any) => (
                        <div key={review.id} className="border-b pb-4 last:border-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-medium">{review.authorName}</span>
                            <span className="text-gray-500 text-sm">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-gray-600">{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Contact & Actions */}
            <div className="space-y-6">
              {/* Contact Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cafe.phone && (
                    <a
                      href={`tel:${cafe.phone}`}
                      className="flex items-center gap-3 text-gray-600 hover:text-primary"
                    >
                      <Phone className="h-5 w-5" />
                      <span>{cafe.phone}</span>
                    </a>
                  )}
                  
                  {cafe.website && (
                    <a
                      href={cafe.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-gray-600 hover:text-primary"
                    >
                      <Globe className="h-5 w-5" />
                      <span>Visit Website</span>
                    </a>
                  )}
                  
                  {cafe.email && (
                    <a
                      href={`mailto:${cafe.email}`}
                      className="flex items-center gap-3 text-gray-600 hover:text-primary"
                    >
                      <Mail className="h-5 w-5" />
                      <span>{cafe.email}</span>
                    </a>
                  )}

                  <div className="pt-4 space-y-2">
                    <Button className="w-full" asChild>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${cafe.name} ${cafe.address} ${cafe.postcode}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Get Directions
                      </a>
                    </Button>
                    
                    <Button variant="outline" className="w-full">
                      <Heart className="h-4 w-4 mr-2" />
                      Save to Favorites
                    </Button>
                    
                    <Button variant="outline" className="w-full">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Map Placeholder */}
              <Card>
                <CardContent className="p-0">
                  <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Map Component Here</span>
                  </div>
                </CardContent>
              </Card>

              {/* Nearby Cafes */}
              <Card>
                <CardHeader>
                  <CardTitle>Nearby Cafes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Discover more great cafes in {cafe.city}
                  </p>
                  <Link href={`/cafes/${cafe.city.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Button variant="outline" className="w-full mt-4">
                      View All in {cafe.city}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
