import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateDistance, getBoundingBox } from '@/lib/geo'
import { getPostcodeCoordinates, looksLikePostcode } from '@/lib/postcodes'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    let lat = parseFloat(searchParams.get('lat') || '')
    let lng = parseFloat(searchParams.get('lng') || '')
    const radius = parseFloat(searchParams.get('radius') || '10')
    const openNow = searchParams.get('openNow') === 'true'
    const amenitiesParam = searchParams.get('amenities')
    const featuresParam = searchParams.get('features')
    const amenities = amenitiesParam ? amenitiesParam.split(',').filter(Boolean) : []
    const features = featuresParam ? featuresParam.split(',').filter(Boolean) : []
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Check if query looks like a postcode and geocode it
    if (query && looksLikePostcode(query) && (isNaN(lat) || isNaN(lng))) {
      const coords = getPostcodeCoordinates(query)
      if (coords) {
        lat = coords.lat
        lng = coords.lng
        console.log(`Geocoded postcode "${query}" to:`, coords)
      }
    }

    // Build where clause
    const where: Prisma.CafeWhereInput = {}

    // Text search
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
        { postcode: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
        { area: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ]
    }

    // Location-based search
    let cafesWithDistance: any[] = []
    
    if (!isNaN(lat) && !isNaN(lng)) {
      // Get bounding box for efficient query
      const bounds = getBoundingBox({ latitude: lat, longitude: lng }, radius)
      
      where.AND = [
        { latitude: { gte: bounds.minLat, lte: bounds.maxLat } },
        { longitude: { gte: bounds.minLng, lte: bounds.maxLng } },
      ]
    }

    // Amenities filter
    if (amenities.length > 0) {
      where.amenities = { hasEvery: amenities }
    }

    // Features filter
    if (features.length > 0) {
      where.features = { hasEvery: features }
    }

    // Get cafes
    const cafes = await prisma.cafe.findMany({
      where,
      take: limit * 2, // Get more to account for distance filtering
      skip: offset,
      orderBy: [
        { rating: 'desc' },
        { name: 'asc' },
      ],
    })

    // Calculate distances and filter by radius
    if (!isNaN(lat) && !isNaN(lng)) {
      cafesWithDistance = cafes
        .map((cafe: any) => ({
          ...cafe,
          distance: calculateDistance(
            { latitude: lat, longitude: lng },
            { latitude: cafe.latitude, longitude: cafe.longitude }
          ),
        }))
        .filter((cafe: any) => cafe.distance <= radius)
        .sort((a: any, b: any) => a.distance - b.distance)
    } else {
      cafesWithDistance = cafes.map((cafe: any) => ({ ...cafe, distance: null }))
    }

    // Filter by open now
    if (openNow) {
      const { isOpenNow } = await import('@/lib/utils')
      cafesWithDistance = cafesWithDistance.filter((cafe: any) => {
        const openStatus = isOpenNow(cafe.openingHours)
        // Only include cafes that are definitively open (not null/no data)
        return openStatus === true
      })
    }

    // Apply limit
    const results = cafesWithDistance.slice(0, limit)

    // Get total count for pagination
    const totalCount = await prisma.cafe.count({ where })

    return NextResponse.json({
      cafes: results,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search cafes', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
