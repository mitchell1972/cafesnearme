import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

  let cafes: { slug: string; updatedAt: Date }[] = []
  let cities: { city: string }[] = []
  let areas: { city: string; area: string | null }[] = []

  try {
    // Get all cafes
    cafes = await prisma.cafe.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    // Get all unique cities
    const citiesResult = await prisma.cafe.groupBy({
      by: ['city'],
      _count: {
        city: true,
      },
    })
    cities = citiesResult

    // Get all unique areas
    const areasResult = await prisma.cafe.groupBy({
      by: ['city', 'area'],
      where: {
        area: {
          not: null,
        },
      },
    })
    areas = areasResult
  } catch (error) {
    console.log('Unable to fetch data for sitemap - database not available')
  }

  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/coffee-shops`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/breakfast-places`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/brunch-spots`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/open-now`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/with-wifi`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/organic-coffee`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/24-hour-cafes`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ]

  // Add cafe pages
  const cafeRoutes = cafes.map((cafe) => ({
    url: `${baseUrl}/cafe/${cafe.slug}`,
    lastModified: cafe.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Add city pages
  const cityRoutes = cities.map((city) => ({
    url: `${baseUrl}/cafes/${city.city.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Add area pages
  const areaRoutes = areas.map((area) => ({
    url: `${baseUrl}/cafes/${area.city.toLowerCase().replace(/\s+/g, '-')}/${area.area?.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...routes, ...cafeRoutes, ...cityRoutes, ...areaRoutes]
}
