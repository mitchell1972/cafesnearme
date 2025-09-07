'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { requestLocationPermission } from '@/lib/utils'
import { useRouter, useSearchParams } from 'next/navigation'

interface SearchBarProps {
  onSearch?: (query: string, location?: { lat: number; lng: number }) => void
  placeholder?: string
  showLocationButton?: boolean
}

export function SearchBar({ 
  onSearch, 
  placeholder = "Search by cafe name, area, or postcode...",
  showLocationButton = true 
}: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Get location from URL params on mount
  useEffect(() => {
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    if (lat && lng) {
      setLocation({ lat: parseFloat(lat), lng: parseFloat(lng) })
    }
  }, [searchParams])

  const performSearch = useCallback((searchQuery: string, coords?: { lat: number; lng: number }) => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (coords || location) {
      const loc = coords || location
      if (loc) {
        params.set('lat', loc.lat.toString())
        params.set('lng', loc.lng.toString())
      }
    }

    if (onSearch) {
      onSearch(searchQuery, coords || location || undefined)
    } else {
      router.push(`/search?${params.toString()}`)
    }
  }, [location, onSearch, router])

  const timeoutRef = useRef<NodeJS.Timeout>()

  const debouncedSearch = useCallback((value: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      performSearch(value)
    }, 500)
  }, [performSearch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    debouncedSearch(value)
  }

  const handleLocationClick = async () => {
    setIsGettingLocation(true)
    try {
      const position = await requestLocationPermission()
      if (position) {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setLocation(coords)
        performSearch(query, coords)
      }
    } catch (error) {
      console.error('Error getting location:', error)
      // Could show a toast notification here
    } finally {
      setIsGettingLocation(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-2xl">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pl-10 pr-4 h-12"
        />
      </div>
      
      {showLocationButton && (
        <Button
          type="button"
          variant={location ? "default" : "outline"}
          size="icon"
          className="h-12 w-12"
          onClick={handleLocationClick}
          disabled={isGettingLocation}
        >
          {isGettingLocation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </Button>
      )}
      
      <Button type="submit" className="h-12">
        Search
      </Button>
    </form>
  )
}
