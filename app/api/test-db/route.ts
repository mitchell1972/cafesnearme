import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    const cafeCount = await prisma.cafe.count();
    
    // Get first cafe if exists
    const firstCafe = await prisma.cafe.findFirst({
      select: {
        id: true,
        name: true,
        slug: true,
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      cafeCount,
      firstCafe,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      nodeEnv: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      nodeEnv: process.env.NODE_ENV,
    }, { status: 500 });
  }
}
