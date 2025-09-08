import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const cafe = await prisma.cafe.findUnique({
      where: { slug: params.slug },
    });
    
    if (!cafe) {
      return NextResponse.json({
        success: false,
        error: 'Cafe not found',
        slug: params.slug,
      }, { status: 404 });
    }
    
    // Check the actual types of the fields with proper type handling
    const amenitiesValue = cafe.amenities as string | string[] | null;
    const featuresValue = cafe.features as string | string[] | null;
    const imagesValue = cafe.images as string | string[] | null;
    
    const fieldTypes = {
      amenities: {
        type: typeof amenitiesValue,
        isArray: Array.isArray(amenitiesValue),
        value: amenitiesValue,
        sample: amenitiesValue ? (
          Array.isArray(amenitiesValue) 
            ? amenitiesValue[0] 
            : (typeof amenitiesValue === 'string' ? amenitiesValue.substring(0, 50) : null)
        ) : null
      },
      features: {
        type: typeof featuresValue,
        isArray: Array.isArray(featuresValue),
        value: featuresValue,
        sample: featuresValue ? (
          Array.isArray(featuresValue) 
            ? featuresValue[0] 
            : (typeof featuresValue === 'string' ? featuresValue.substring(0, 50) : null)
        ) : null
      },
      images: {
        type: typeof imagesValue,
        isArray: Array.isArray(imagesValue),
        value: imagesValue,
        sample: imagesValue ? (
          Array.isArray(imagesValue) 
            ? imagesValue[0] 
            : (typeof imagesValue === 'string' ? imagesValue.substring(0, 50) : null)
        ) : null
      }
    };
    
    return NextResponse.json({
      success: true,
      cafe: {
        id: cafe.id,
        name: cafe.name,
        slug: cafe.slug,
        city: cafe.city,
      },
      fieldTypes,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
    });
  } catch (error) {
    console.error('Error fetching cafe:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      slug: params.slug,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
    }, { status: 500 });
  }
}
