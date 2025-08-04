import { PrismaClient } from '@/generated/prisma'

const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}

//every time next.js hot reload the webpage and if we dont use globalForPrisma.prisma then ew PrismaClient() called every time.
export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
