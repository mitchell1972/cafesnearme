'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Wifi, Car, Trees, Heart, ExternalLink } from 'lucide-react'
import { formatDistance, formatOpeningHours, isOpenNow, getTodayHours } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

interface CafeCardProps {
  cafe: {
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
    amenities?: string | null
    features?: string | null
    openingHours?: any
  }
  showDistance?: boolean
  onFavorite?: (cafeId: string) => void
  isFavorite?: boolean
}

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="h-4 w-4" />,
  Parking: <Car className="h-4 w-4" />,
  'Outdoor Seating': <Trees className="h-4 w-4" />,
}

export function CafeCard({ cafe, showDistance = true, onFavorite, isFavorite = false }: CafeCardProps) {
  const isOpen = isOpenNow(cafe.openingHours)
  const amenities = cafe.amenities ? cafe.amenities.split(',') : []
  
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <Link href={`/cafe/${cafe.slug}`}>
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          {cafe.thumbnail ? (
            <Image
              src={cafe.thumbnail}
              alt={cafe.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
              <span className="text-4xl">☕</span>
            </div>
          )}
          
          {/* Distance badge */}
          {showDistance && cafe.distance !== null && cafe.distance !== undefined && (
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium">
              {formatDistance(cafe.distance)}
            </div>
          )}
          
          {/* Open/Closed badge */}
          {isOpen !== null && (
            <div className={`absolute top-2 right-2 rounded-full px-3 py-1 text-sm font-medium ${
              isOpen ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
            }`}>
              {isOpen ? 'Open' : 'Closed'}
            </div>
          )}
        </div>
      </Link>
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Link href={`/cafe/${cafe.slug}`}>
              <CardTitle className="text-lg hover:text-primary transition-colors">
                {cafe.name}
              </CardTitle>
            </Link>
            <CardDescription className="mt-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {cafe.area ? `${cafe.area}, ${cafe.city}` : cafe.city}
            </CardDescription>
          </div>
          
          {/* Favorite button */}
          {onFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-2"
              onClick={(e) => {
                e.preventDefault()
                onFavorite(cafe.id)
              }}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
            </Button>
          )}
        </div>
        
        {/* Rating and price */}
        <div className="flex items-center gap-4 mt-2">
          {cafe.rating && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span className="font-medium">{cafe.rating.toFixed(1)}</span>
              <span className="text-muted-foreground text-sm">({cafe.reviewCount})</span>
            </div>
          )}
          {cafe.priceRange && (
            <span className="text-muted-foreground">{cafe.priceRange}</span>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {amenities.slice(0, 3).map((amenity) => (
              <div
                key={amenity}
                className="flex items-center gap-1 text-sm text-muted-foreground"
              >
                {amenityIcons[amenity] || <span className="h-4 w-4">•</span>}
                <span>{amenity}</span>
              </div>
            ))}
            {amenities.length > 3 && (
              <span className="text-sm text-muted-foreground">
                +{amenities.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* Opening hours */}
        {cafe.openingHours && Object.keys(cafe.openingHours).length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {isOpen === null ? 'Hours' : isOpen ? 'Open' : 'Closed'}
              {getTodayHours(cafe.openingHours) !== 'Hours not available' && 
                ` • ${getTodayHours(cafe.openingHours)}`
              }
            </span>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <Link href={`/cafe/${cafe.slug}`} className="flex-1">
            <Button variant="default" className="w-full">
              View Details
            </Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.preventDefault()
              window.open(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${cafe.name} ${cafe.address} ${cafe.postcode}`
                )}`,
                '_blank'
              )
            }}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
