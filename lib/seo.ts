import { Metadata } from 'next'

export interface SEOProps {
  title: string
  description: string
  keywords?: string[]
  openGraph?: {
    title?: string
    description?: string
    images?: string[]
    url?: string
  }
  twitter?: {
    card?: 'summary' | 'summary_large_image'
    creator?: string
  }
  canonical?: string
  noindex?: boolean
}

export function generateMetadata(props: SEOProps): Metadata {
  const { title, description, keywords, openGraph, twitter, canonical, noindex } = props

  return {
    title,
    description,
    keywords: keywords?.join(', '),
    openGraph: {
      title: openGraph?.title || title,
      description: openGraph?.description || description,
      images: openGraph?.images || [],
      url: openGraph?.url,
      type: 'website',
      siteName: 'Cafes Near Me',
    },
    twitter: {
      card: twitter?.card || 'summary_large_image',
      title: openGraph?.title || title,
      description: openGraph?.description || description,
      creator: twitter?.creator,
    },
    alternates: {
      canonical: canonical,
    },
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
  }
}

export function generateCafeStructuredData(cafe: any) {
  const openingHours = cafe.openingHours || {}
  const openingHoursSpec = Object.entries(openingHours).map(([day, hours]: [string, any]) => {
    if (!hours || !hours.open || !hours.close) return null
    return {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: day.charAt(0).toUpperCase() + day.slice(1),
      opens: hours.open,
      closes: hours.close,
    }
  }).filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    '@id': `${process.env.NEXT_PUBLIC_APP_URL}/cafe/${cafe.slug}`,
    name: cafe.name,
    description: cafe.description,
    url: cafe.website,
    telephone: cafe.phone,
    email: cafe.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: cafe.address,
      addressLocality: cafe.city,
      postalCode: cafe.postcode,
      addressCountry: 'GB',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: cafe.latitude,
      longitude: cafe.longitude,
    },
    openingHoursSpecification: openingHoursSpec,
    priceRange: cafe.priceRange,
    servesCuisine: 'Coffee',
    aggregateRating: cafe.rating ? {
      '@type': 'AggregateRating',
      ratingValue: cafe.rating,
      reviewCount: cafe.reviewCount,
    } : undefined,
    amenityFeature: cafe.amenities?.map((amenity: string) => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity,
      value: true,
    })),
    image: cafe.images?.length > 0 ? cafe.images : cafe.thumbnail ? [cafe.thumbnail] : undefined,
  }
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${process.env.NEXT_PUBLIC_APP_URL}${item.url}`,
    })),
  }
}

export function generateSearchActionStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: process.env.NEXT_PUBLIC_APP_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Generate dynamic meta descriptions for different page types
 */
export function generateMetaDescription(type: string, data: any): string {
  switch (type) {
    case 'home':
      return 'Find the best cafes and coffee shops near you. Browse local coffee spots with WiFi, outdoor seating, and more. Open now with real-time information.'
    
    case 'city':
      return `Discover ${data.count || ''} cafes and coffee shops in ${data.city}. Find the perfect spot for coffee, breakfast, or brunch with detailed information and opening hours.`
    
    case 'area':
      return `Find the best ${data.count || ''} cafes near ${data.area}, ${data.city}. Browse local coffee shops with ${data.features || 'great amenities'}. Open now with real-time updates.`
    
    case 'cafe':
      return `${data.name} in ${data.city}. ${data.description || `Visit us at ${data.address} for great coffee and atmosphere.`} ${data.amenities?.includes('WiFi') ? '✓ Free WiFi' : ''} ${data.amenities?.includes('Parking') ? '✓ Parking' : ''}`
    
    case 'category':
      return `Best ${data.category} near you. Find local spots offering ${data.features || 'exceptional service'}. Browse with opening hours, amenities, and location details.`
    
    default:
      return 'Find the best cafes and coffee shops near you with detailed information, opening hours, and amenities.'
  }
}

/**
 * Generate SEO-friendly slugs
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
}
