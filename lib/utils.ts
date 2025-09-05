import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if a cafe is currently open based on opening hours
 */
export function isOpenNow(openingHours: any): boolean | null {
  // Return null if no opening hours data is available
  if (!openingHours || Object.keys(openingHours).length === 0) return null

  const now = new Date()
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const currentDay = dayNames[now.getDay()]
  const currentTime = now.getHours() * 100 + now.getMinutes()

  // Log for debugging
  if (typeof window !== 'undefined') {
    console.log('Checking if open:', {
      currentDay,
      currentTime,
      openingHours: openingHours[currentDay],
      fullOpeningHours: openingHours
    })
  }

  const todayHours = openingHours[currentDay]
  if (!todayHours || !todayHours.open || !todayHours.close) return false

  const openTime = parseTime(todayHours.open)
  const closeTime = parseTime(todayHours.close)

  // Handle cases where close time is after midnight
  if (closeTime < openTime) {
    return currentTime >= openTime || currentTime <= closeTime
  }

  return currentTime >= openTime && currentTime <= closeTime
}

/**
 * Parse time string (HH:MM) to number for comparison
 */
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 100 + minutes
}

/**
 * Format distance for display (in miles)
 */
export function formatDistance(distance: number): string {
  // Convert km to miles (1 km = 0.621371 miles)
  const miles = distance * 0.621371
  
  if (miles < 0.1) return 'Less than 0.1 mi'
  if (miles < 1) return `${miles.toFixed(1)} mi`
  return `${miles.toFixed(0)} mi`
}

/**
 * Format opening hours for display
 */
export function formatOpeningHours(hours: any): string {
  if (!hours || !hours.open || !hours.close) return 'Closed'
  return `${hours.open} - ${hours.close}`
}

/**
 * Get today's opening hours
 */
export function getTodayHours(openingHours: any): string {
  if (!openingHours) return 'Hours not available'

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const today = dayNames[new Date().getDay()]
  
  return formatOpeningHours(openingHours[today])
}

/**
 * Format price range for display
 */
export function formatPriceRange(priceRange: string | null): string {
  if (!priceRange) return ''
  return priceRange
}

/**
 * Format array of amenities for display
 */
export function formatAmenities(amenities: string[]): string {
  if (!amenities || amenities.length === 0) return ''
  return amenities.join(' • ')
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Format postcode for consistent display
 */
export function formatPostcode(postcode: string): string {
  const cleaned = postcode.toUpperCase().replace(/\s+/g, '')
  if (cleaned.length <= 4) return cleaned
  return `${cleaned.slice(0, -3)} ${cleaned.slice(-3)}`
}

/**
 * Validate UK postcode format
 */
export function isValidPostcode(postcode: string): boolean {
  const regex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i
  return regex.test(postcode)
}

/**
 * Extract city from address
 */
export function extractCityFromAddress(address: string): string {
  // Simple extraction - in real app might use geocoding API
  const parts = address.split(',').map(p => p.trim())
  return parts[parts.length - 2] || parts[parts.length - 1] || ''
}

/**
 * Generate share URL
 */
export function generateShareUrl(path: string): string {
  if (typeof window === 'undefined') {
    return `${process.env.NEXT_PUBLIC_APP_URL}${path}`
  }
  return `${window.location.origin}${path}`
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/**
 * Request location permission
 */
export async function requestLocationPermission(): Promise<GeolocationPosition | null> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    )
  })
}
