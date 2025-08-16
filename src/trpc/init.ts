/**
 * tRPC Initialization and Configuration
 * 
 * Sets up the core tRPC server infrastructure with authentication context,
 * data transformation, and procedure definitions for the VibeCode application.
 * 
 * Key Features:
 * - Clerk authentication integration
 * - SuperJSON data transformation for Date/BigInt/etc
 * - Protected procedures requiring authentication
 * - Type-safe context creation with caching
 * - Middleware for authentication validation
 * 
 * Architecture:
 * - Context includes Clerk auth state
 * - Middleware enforces authentication on protected routes
 * - SuperJSON enables rich data type serialization
 * - Cached context creation for performance
 */

import { auth } from '@clerk/nextjs/server';
import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import superjson from 'superjson';

/**
 * Creates tRPC context with authentication state
 * 
 * Cached function that provides authentication context for all tRPC procedures.
 * Uses Clerk's auth() to get current user session and includes it in context.
 * 
 * @returns Context object containing authentication state
 */
export const createTRPCContext = cache(async () => {
    return { auth: await auth() }
});

/**
 * Type definition for tRPC context
 * Inferred from the createTRPCContext return type
 */
export type Context = Awaited<ReturnType<typeof createTRPCContext>>

/**
 * Initialize tRPC with context and data transformation
 * 
 * Configures tRPC with:
 * - Context type from createTRPCContext
 * - SuperJSON transformer for rich data types
 * - Base configuration for all procedures
 */
const t = initTRPC.context<Context>().create({
    /**
     * SuperJSON transformer enables serialization of:
     * - Date objects
     * - BigInt values
     * - undefined values
     * - Regex objects
     * - Maps and Sets
     * @see https://trpc.io/docs/server/data-transformers
     */
    transformer: superjson,
});

/**
 * Authentication middleware
 * 
 * Validates that the user is authenticated before allowing access
 * to protected procedures. Throws UNAUTHORIZED error if no user ID.
 * 
 * @returns Middleware that ensures authentication and provides non-nullable auth
 */
const isAuthed = t.middleware(({ next, ctx }) => {
    if (!ctx.auth.userId) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated. Please Login or Signup"
        })
    }
    
    return next({
        ctx: {
            // Infers the auth as non-nullable for protected procedures
            auth: ctx.auth,
        },
    });
});

/**
 * tRPC Router and Procedure Exports
 * 
 * Provides the building blocks for creating tRPC routers and procedures:
 * - createTRPCRouter: Creates nested route structures
 * - createCallerFactory: Server-side procedure calling
 * - baseProcedure: Unprotected procedures (public access)
 * - protectedProcedure: Authenticated procedures (requires login)
 */
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);