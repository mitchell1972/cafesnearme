/**
 * UK Postcode utilities
 */

// Approximate coordinates for UK postcode areas
// In production, you'd use a proper geocoding API
const POSTCODE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // London
  'E': { lat: 51.5320, lng: 0.0551 },
  'EC': { lat: 51.5174, lng: -0.0836 },
  'N': { lat: 51.5647, lng: -0.1055 },
  'NW': { lat: 51.5344, lng: -0.1910 },
  'SE': { lat: 51.4832, lng: -0.0045 },
  'SW': { lat: 51.4614, lng: -0.1383 },
  'W': { lat: 51.5136, lng: -0.1997 },
  'WC': { lat: 51.5246, lng: -0.1340 },
  
  // Bromley area postcodes
  'BR': { lat: 51.4059, lng: 0.0149 }, // Bromley general
  'BR1': { lat: 51.4059, lng: 0.0149 }, // Bromley
  'BR2': { lat: 51.3892, lng: 0.0211 }, // Bickley/Bromley Common
  'BR3': { lat: 51.4084, lng: -0.0197 }, // Beckenham
  'BR4': { lat: 51.3789, lng: -0.0197 }, // West Wickham
  'BR5': { lat: 51.3653, lng: 0.0831 }, // Orpington
  'BR6': { lat: 51.3517, lng: 0.1033 }, // Farnborough
  'BR7': { lat: 51.4059, lng: 0.0649 }, // Chislehurst
  'BR8': { lat: 51.4523, lng: 0.1494 }, // Swanley
  
  // East of England
  'CB': { lat: 52.2053, lng: 0.1218 }, // Cambridge
  'CB9': { lat: 52.0736, lng: 0.4472 }, // Saffron Walden
  'CM': { lat: 51.7343, lng: 0.4691 }, // Chelmsford
  'CM0': { lat: 51.6755, lng: 0.6795 }, // Burnham-on-Crouch
  'CM9': { lat: 51.7316, lng: 0.6773 }, // Maldon
  'CO': { lat: 51.8959, lng: 0.8919 }, // Colchester
  'CO1': { lat: 51.8959, lng: 0.8919 }, // Colchester Town Centre
  'CO2': { lat: 51.8892, lng: 0.8640 }, // Colchester South
  'CO3': { lat: 51.8914, lng: 0.8485 }, // Colchester West
  'CO4': { lat: 51.9023, lng: 0.9093 }, // Colchester North
  'CO9': { lat: 51.9319, lng: 0.6061 }, // Halstead
  'CO10': { lat: 52.0375, lng: 0.7329 }, // Sudbury
  'EN9': { lat: 51.8097, lng: 0.0105 }, // Waltham Abbey
  'IG': { lat: 51.5590, lng: 0.0821 }, // Ilford/Loughton area
  'IG10': { lat: 51.6458, lng: 0.0754 }, // Loughton
  'IG7': { lat: 51.6094, lng: 0.0342 }, // Chigwell
  'IG8': { lat: 51.6194, lng: 0.0934 }, // Woodford Green
  'IG9': { lat: 51.6097, lng: 0.0505 }, // Buckhurst Hill
  'IP': { lat: 52.0567, lng: 1.1582 }, // Ipswich
  'IP1': { lat: 52.0567, lng: 1.1582 }, // Ipswich Central
  'IP2': { lat: 52.0567, lng: 1.1300 }, // Ipswich East
  'IP3': { lat: 52.0567, lng: 1.1100 }, // Ipswich South
  'IP4': { lat: 52.0667, lng: 1.1582 }, // Ipswich North
  'NR': { lat: 52.9493, lng: 1.1328 }, // Great Yarmouth/Lowestoft area
  'PE': { lat: 52.5695, lng: -0.2405 }, // Peterborough
  'RM': { lat: 51.5590, lng: 0.1834 }, // Romford
  'RM1': { lat: 51.5764, lng: 0.1834 }, // Romford
  'RM2': { lat: 51.5764, lng: 0.1634 }, // Gidea Park
  'RM3': { lat: 51.5964, lng: 0.2234 }, // Harold Wood
  'SG': { lat: 51.9017, lng: -0.2018 }, // Stevenage
  'SS': { lat: 51.5456, lng: 0.7077 }, // Southend
  'SS0': { lat: 51.5344, lng: 0.7052 }, // Westcliff-on-Sea
  'SS1': { lat: 51.5456, lng: 0.7077 }, // Southend Central
  'SS2': { lat: 51.5372, lng: 0.7142 }, // Southend North
  'SS3': { lat: 51.5372, lng: 0.7942 }, // Shoeburyness
  'SS4': { lat: 51.5172, lng: 0.6542 }, // Rochford
  'SS5': { lat: 51.5572, lng: 0.6542 }, // Hockley
  'SS6': { lat: 51.5672, lng: 0.6842 }, // Rayleigh
  'SS7': { lat: 51.5172, lng: 0.5842 }, // Benfleet
  'SS8': { lat: 51.5072, lng: 0.5742 }, // Canvey Island
  'SS9': { lat: 51.5411, lng: 0.6529 }, // Leigh-on-Sea
  
  // Add more as needed...
}

/**
 * Get approximate coordinates for a UK postcode
 */
export function getPostcodeCoordinates(postcode: string): { lat: number; lng: number } | null {
  if (!postcode) return null
  
  const cleaned = postcode.toUpperCase().replace(/\s+/g, '')
  
  // Sort keys by length (descending) to match most specific first
  const sortedKeys = Object.keys(POSTCODE_COORDINATES).sort((a, b) => b.length - a.length)
  
  // Find the most specific match
  for (const key of sortedKeys) {
    if (cleaned.startsWith(key)) {
      return POSTCODE_COORDINATES[key]
    }
  }
  
  return null
}

/**
 * Check if a string looks like a UK postcode
 */
export function looksLikePostcode(query: string): boolean {
  if (!query) return false
  
  // Remove spaces and check length
  const cleaned = query.replace(/\s+/g, '')
  if (cleaned.length < 2 || cleaned.length > 8) return false
  
  // Basic UK postcode pattern
  // Full: SW1A 1AA, Partial: SW1, E14, CO1
  const patterns = [
    /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i, // Full postcode
    /^[A-Z]{1,2}[0-9][A-Z0-9]?$/i, // Partial postcode (area)
    /^[A-Z]{1,2}[0-9]$/i, // Short partial (e.g., E1, SW1)
  ]
  
  return patterns.some(pattern => pattern.test(query))
}

/**
 * For more accurate results, you could use a free API like postcodes.io
 * Example:
 * 
 * export async function getPostcodeCoordinatesFromAPI(postcode: string) {
 *   try {
 *     const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`)
 *     const data = await response.json()
 *     if (data.status === 200 && data.result) {
 *       return {
 *         lat: data.result.latitude,
 *         lng: data.result.longitude
 *       }
 *     }
 *   } catch (error) {
 *     console.error('Postcode lookup failed:', error)
 *   }
 *   return null
 * }
 */
