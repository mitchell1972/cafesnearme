import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const cafe = await prisma.cafe.findUnique({
      where: { slug: params.slug },
      include: {
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            reviews: true,
            favorites: true,
          },
        },
      },
    });
    
    if (!cafe) {
      return NextResponse.json({
        success: false,
        error: 'Cafe not found',
        slug: params.slug,
      }, { status: 404 });
    }
    
    // Test parsing of different fields
    const debugInfo: any = {
      success: true,
      cafe: {
        id: cafe.id,
        name: cafe.name,
        slug: cafe.slug,
        city: cafe.city,
      },
      dataTypes: {},
      parseTests: {},
      errors: []
    };
    
    // Check amenities
    try {
      const amenitiesStr = cafe.amenities as unknown as string;
      debugInfo.dataTypes.amenities = {
        type: typeof amenitiesStr,
        value: amenitiesStr,
        isEmpty: !amenitiesStr || amenitiesStr.trim() === '',
        parsed: amenitiesStr && amenitiesStr.trim() !== '' 
          ? amenitiesStr.split(',').map((a: string) => a.trim()).filter(Boolean)
          : []
      };
    } catch (e: any) {
      debugInfo.errors.push({ field: 'amenities', error: e.message });
    }
    
    // Check features
    try {
      const featuresStr = cafe.features as unknown as string;
      debugInfo.dataTypes.features = {
        type: typeof featuresStr,
        value: featuresStr,
        isEmpty: !featuresStr || featuresStr.trim() === '',
        parsed: featuresStr && featuresStr.trim() !== '' 
          ? featuresStr.split(',').map((f: string) => f.trim()).filter(Boolean)
          : []
      };
    } catch (e: any) {
      debugInfo.errors.push({ field: 'features', error: e.message });
    }
    
    // Check images
    try {
      const imagesStr = cafe.images as unknown as string;
      debugInfo.dataTypes.images = {
        type: typeof imagesStr,
        value: imagesStr,
        isEmpty: !imagesStr || imagesStr.trim() === '',
        parsed: imagesStr && imagesStr.trim() !== '' 
          ? imagesStr.split(',').map((img: string) => img.trim()).filter(Boolean)
          : []
      };
    } catch (e: any) {
      debugInfo.errors.push({ field: 'images', error: e.message });
    }
    
    // Check opening hours
    try {
      const openingHoursStr = cafe.openingHours;
      debugInfo.dataTypes.openingHours = {
        type: typeof openingHoursStr,
        value: openingHoursStr,
        isNull: openingHoursStr === null,
        isEmpty: !openingHoursStr || openingHoursStr === '',
      };
      
      if (openingHoursStr && openingHoursStr !== '') {
        try {
          const parsed = JSON.parse(openingHoursStr as string);
          debugInfo.dataTypes.openingHours.parsed = parsed;
          debugInfo.dataTypes.openingHours.parseSuccess = true;
        } catch (parseError: any) {
          debugInfo.dataTypes.openingHours.parseError = parseError.message;
          debugInfo.dataTypes.openingHours.parseSuccess = false;
        }
      }
    } catch (e: any) {
      debugInfo.errors.push({ field: 'openingHours', error: e.message });
    }
    
    // Check other fields
    debugInfo.dataTypes.description = {
      type: typeof cafe.description,
      value: cafe.description,
      isNull: cafe.description === null
    };
    
    debugInfo.dataTypes.thumbnail = {
      type: typeof cafe.thumbnail,
      value: cafe.thumbnail,
      isNull: cafe.thumbnail === null
    };
    
    debugInfo.dataTypes.rating = {
      type: typeof cafe.rating,
      value: cafe.rating,
      isNull: cafe.rating === null
    };
    
    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      slug: params.slug,
    }, { status: 500 });
  }
}
