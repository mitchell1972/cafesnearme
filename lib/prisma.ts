// Conditionally import PrismaClient to avoid errors when DATABASE_URL is not set
let PrismaClient: any

// Only import Prisma on the server side
if (typeof window === 'undefined') {
  try {
    const prismaModule = require('@prisma/client')
    PrismaClient = prismaModule.PrismaClient
  } catch (error) {
    console.warn('Prisma Client not available - database may not be configured')
    PrismaClient = null
  }
} else {
  // On client side, set to null to prevent bundling
  PrismaClient = null
}

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined
}

function createPrismaClient() {
  if (!PrismaClient) {
    // Return a mock client that won't crash the app
    return {
      cafe: {
        findMany: async () => [],
        findUnique: async () => null,
        count: async () => 0,
        groupBy: async () => [],
        create: async () => { throw new Error('Database not configured') },
        update: async () => { throw new Error('Database not configured') },
        delete: async () => { throw new Error('Database not configured') },
      },
      importLog: {
        create: async () => { throw new Error('Database not configured') },
        findMany: async () => [],
      },
      review: {
        findMany: async () => [],
        create: async () => { throw new Error('Database not configured') },
      },
      favorite: {
        findMany: async () => [],
        create: async () => { throw new Error('Database not configured') },
        delete: async () => { throw new Error('Database not configured') },
      },
      $disconnect: async () => {},
      $connect: async () => {},
    }
  }
  
  try {
    return new PrismaClient()
  } catch (error) {
    console.warn('Failed to initialize Prisma Client - database may not be configured')
    // Return a mock client that won't crash the app
    return {
      cafe: {
        findMany: async () => [],
        findUnique: async () => null,
        count: async () => 0,
        groupBy: async () => [],
        create: async () => { throw new Error('Database not configured') },
        update: async () => { throw new Error('Database not configured') },
        delete: async () => { throw new Error('Database not configured') },
      },
      importLog: {
        create: async () => { throw new Error('Database not configured') },
        findMany: async () => [],
      },
      review: {
        findMany: async () => [],
        create: async () => { throw new Error('Database not configured') },
      },
      favorite: {
        findMany: async () => [],
        create: async () => { throw new Error('Database not configured') },
        delete: async () => { throw new Error('Database not configured') },
      },
      $disconnect: async () => {},
      $connect: async () => {},
    }
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
