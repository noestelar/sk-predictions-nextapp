import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  // Use the pooled connection string from Vercel/Supabase
  const url = process.env.DATABASE_POSTGRES_PRISMA_URL || process.env.DATABASE_URL

  if (!url) {
    throw new Error('DATABASE_POSTGRES_PRISMA_URL (or DATABASE_URL) is not set.')
  }

  return new PrismaClient({
    log: ['query', 'error', 'warn'],
    datasources: {
      db: {
        url
      }
    }
  })
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export default prisma
