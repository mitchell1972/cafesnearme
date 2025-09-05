/**
 * Geolocation utilities for calculating distances and handling coordinates
 */

export interface Coordinates {
  latitude: number
  longitude: number
}

/**
 * Calculate distance between two points using Haversine formula
 * @returns Distance in miles
 */
export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRad(point2.latitude - point1.latitude)
  const dLon = toRad(point2.longitude - point1.longitude)
  const lat1 = toRad(point1.latitude)
  const lat2 = toRad(point2.latitude)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 10) / 10 // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Convert miles to kilometers
 */
export function milesToKm(miles: number): number {
  return Math.round(miles * 1.60934 * 10) / 10
}

/**
 * Format distance for display
 */
export function formatDistance(miles: number, unit: 'miles' | 'km' = 'miles'): string {
  if (unit === 'km') {
    const km = milesToKm(miles)
    return km < 1 ? `${Math.round(km * 1000)}m` : `${km}km`
  }
  return miles < 0.1 ? 'Nearby' : `${miles} mi`
}

/**
 * Get bounding box for a given center point and radius
 * Used for efficient database queries
 */
export function getBoundingBox(
  center: Coordinates,
  radiusMiles: number
): {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
} {
  const lat = center.latitude
  const lng = center.longitude
  
  // Approximate degrees per mile
  const latDegrees = radiusMiles / 69
  const lngDegrees = radiusMiles / (69 * Math.cos(toRad(lat)))

  return {
    minLat: lat - latDegrees,
    maxLat: lat + latDegrees,
    minLng: lng - lngDegrees,
    maxLng: lng + lngDegrees,
  }
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(coords: any): coords is Coordinates {
  return (
    coords &&
    typeof coords.latitude === 'number' &&
    typeof coords.longitude === 'number' &&
    coords.latitude >= -90 &&
    coords.latitude <= 90 &&
    coords.longitude >= -180 &&
    coords.longitude <= 180
  )
}

/**
 * Parse coordinates from various formats
 */
export function parseCoordinates(input: string): Coordinates | null {
  // Try to parse "lat,lng" format
  const parts = input.split(',').map(p => p.trim())
  if (parts.length === 2) {
    const lat = parseFloat(parts[0])
    const lng = parseFloat(parts[1])
    if (!isNaN(lat) && !isNaN(lng)) {
      const coords = { latitude: lat, longitude: lng }
      return isValidCoordinates(coords) ? coords : null
    }
  }
  return null
}
