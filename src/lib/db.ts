/**
 * Database Client Configuration
 * 
 * This file sets up the Prisma database client with proper configuration
 * for both development and production environments.
 * 
 * Key Features:
 * - Singleton pattern to prevent multiple database connections
 * - Development hot-reload support
 * - Global instance management
 * - Type-safe database operations
 */

import { PrismaClient } from '@/generated/prisma'

/**
 * Global variable to store the Prisma client instance
 * This ensures we don't create multiple connections during development hot reloads
 */
const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}

/**
 * Database client instance
 * 
 * In development: Uses global instance to prevent multiple connections during hot reloads
 * In production: Creates a new instance for each deployment
 * 
 * Benefits:
 * - Prevents "too many connections" errors in development
 * - Ensures proper connection pooling
 * - Maintains type safety with generated Prisma client
 */
export const prisma = globalForPrisma.prisma || new PrismaClient()

/**
 * Store the Prisma instance globally in development
 * This prevents Next.js hot reload from creating multiple database connections
 */
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
