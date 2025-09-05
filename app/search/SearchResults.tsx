'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CafeCard } from '@/components/CafeCard'
import { CafeCardSkeleton } from '@/components/CafeCardSkeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Filter, Clock, MapPin } from 'lucide-react'
import { looksLikePostcode } from '@/lib/postcodes'

interface Cafe {
  id: string
  name: string
  slug: string
  address: string
  city: string
  area?: string | null
  postcode: string
  distance?: number | null
  rating?: number | null
  reviewCount?: number
  thumbnail?: string | null
  priceRange?: string | null
  amenities?: string[]
  features?: string[]
  openingHours?: any
}

const AMENITY_OPTIONS = [
  'WiFi',
  'Parking',
  'Outdoor Seating',
  'Wheelchair Accessible',
  'Dog Friendly',
  'Power Outlets',
]

const FEATURE_OPTIONS = [
  'Breakfast',
  'Brunch',
  'Lunch',
  'Vegan Options',
  'Gluten Free',
  'Organic Coffee',
]

export function SearchResults() {
  const searchParams = useSearchParams()
  const [cafes, setCafes] = useState<Cafe[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [filters, setFilters] = useState({
    openNow: searchParams.get('openNow') === 'true',
    radius: searchParams.get('radius') || '5',  // Default to 5 miles
    amenities: searchParams.get('amenities')?.split(',').filter(Boolean) || [],
    features: searchParams.get('features')?.split(',').filter(Boolean) || [],
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchCafes(true)
  }, [searchParams])

  // Apply filters immediately when openNow or radius changes
  useEffect(() => {
    fetchCafes(true)
  }, [filters.openNow, filters.radius])

  const fetchCafes = async (reset = false) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      // Add search params
      const q = searchParams.get('q')
      const lat = searchParams.get('lat')
      const lng = searchParams.get('lng')
      
      if (q) params.set('q', q)
      if (lat) params.set('lat', lat)
      if (lng) params.set('lng', lng)
      
      // Add filters
      // Convert miles to kilometers for radius (1 mile = 1.609 km)
      const radiusInKm = (parseFloat(filters.radius) * 1.609).toString()
      params.set('radius', radiusInKm)
      if (filters.openNow) params.set('openNow', 'true')
      if (filters.amenities.length > 0) params.set('amenities', filters.amenities.join(','))
      if (filters.features.length > 0) params.set('features', filters.features.join(','))
      
      // Add pagination
      params.set('limit', '12')
      params.set('offset', reset ? '0' : offset.toString())

      const response = await fetch(`/api/search?${params}`)
      const data = await response.json()

      if (reset) {
        setCafes(data.cafes)
        setOffset(12)
      } else {
        setCafes(prev => [...prev, ...data.cafes])
        setOffset(prev => prev + 12)
      }
      
      setHasMore(data.pagination.hasMore)
    } catch (error) {
      console.error('Error fetching cafes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    setOffset(0)
    fetchCafes(true)
  }

  const toggleAmenity = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const toggleFeature = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  return (
    <div className="flex gap-8">
      {/* Filters Sidebar */}
      <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 shrink-0`}>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          
          {/* Open Now */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="open-now" className="flex items-center gap-2">
                Open Now
                {filters.openNow && (
                  <span className="text-xs text-primary font-medium">(Active)</span>
                )}
              </Label>
              <Switch
                id="open-now"
                checked={filters.openNow}
                onCheckedChange={(checked) => handleFilterChange('openNow', checked)}
              />
            </div>
          </div>

          {/* Distance */}
          <div className="mb-6">
            <Label htmlFor="radius">Distance</Label>
            <Select value={filters.radius} onValueChange={(value) => handleFilterChange('radius', value)}>
              <SelectTrigger id="radius" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Within 1 mile</SelectItem>
                <SelectItem value="5">Within 5 miles</SelectItem>
                <SelectItem value="10">Within 10 miles</SelectItem>
                <SelectItem value="20">Within 20 miles</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amenities */}
          <div className="mb-6">
            <Label>Amenities</Label>
            <div className="mt-2 space-y-2">
              {AMENITY_OPTIONS.map(amenity => (
                <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    className="rounded"
                  />
                  <span className="text-sm">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <Label>Features</Label>
            <div className="mt-2 space-y-2">
              {FEATURE_OPTIONS.map(feature => (
                <label key={feature} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.features.includes(feature)}
                    onChange={() => toggleFeature(feature)}
                    className="rounded"
                  />
                  <span className="text-sm">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          <Button onClick={applyFilters} className="w-full">
            Apply Filters
          </Button>
        </div>
      </aside>

      {/* Results */}
      <div className="flex-1">
        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        {/* Results header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {loading && cafes.length === 0 ? 'Searching...' : `${cafes.length} cafes found`}
          </h2>
          <div className="flex flex-col gap-1 mt-1">
            {searchParams.get('q') && (
              <p className="text-gray-600">
                Results for "{searchParams.get('q')}"
              </p>
            )}
            {searchParams.get('q') && looksLikePostcode(searchParams.get('q') || '') && (
              <p className="text-blue-700 font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Showing cafes within {filters.radius} mile{filters.radius !== '1' ? 's' : ''} of {searchParams.get('q')?.toUpperCase()}
              </p>
            )}
            {filters.openNow && (
              <p className="text-primary font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Showing only cafes open now
              </p>
            )}
          </div>
        </div>

        {/* Cafe grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && cafes.length === 0 ? (
            // Initial loading state
            Array.from({ length: 6 }).map((_, i) => (
              <CafeCardSkeleton key={i} />
            ))
          ) : cafes.length === 0 ? (
            // No results
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 text-lg">No cafes found matching your criteria.</p>
              <p className="text-gray-500 mt-2">Try adjusting your filters or search in a different area.</p>
            </div>
          ) : (
            // Results
            cafes.map((cafe) => (
              <CafeCard key={cafe.id} cafe={cafe} />
            ))
          )}
        </div>

        {/* Load more */}
        {hasMore && !loading && (
          <div className="text-center mt-8">
            <Button
              onClick={() => fetchCafes(false)}
              variant="outline"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
