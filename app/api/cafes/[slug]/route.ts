import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const cafe = await prisma.cafe.findUnique({
      where: { slug: params.slug },
      include: {
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            reviews: true,
            favorites: true,
          },
        },
      },
    })

    if (!cafe) {
      return NextResponse.json(
        { error: 'Cafe not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(cafe)
  } catch (error) {
    console.error('Cafe fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cafe', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
