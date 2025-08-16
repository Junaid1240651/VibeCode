/**
 * Authentication Middleware
 * 
 * This middleware handles authentication for the entire application using Clerk.
 * It protects routes that require authentication and allows public access to specific routes.
 * 
 * Key Features:
 * - Route-based authentication protection
 * - Public route configuration
 * - Integration with Clerk authentication system
 * - Automatic redirection for unauthorized users
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

/**
 * Define which routes are publicly accessible without authentication
 * These routes can be accessed by anyone without logging in
 */
const isPublicRoute = createRouteMatcher([
    '/sign-in(.*)',    // Sign-in page and sub-routes
    '/',               // Home page (landing page)
    '/api(.*)',        // All API routes (some may have their own auth)
    '/sign-up(.*)',    // Sign-up page and sub-routes
    '/pricing(.*)'     // Pricing page and sub-routes
])

/**
 * Clerk middleware function
 * 
 * This function runs on every request and determines whether
 * the user needs to be authenticated to access the route.
 * 
 * Logic:
 * - If the route is public, allow access
 * - If the route is private, require authentication
 */
export default clerkMiddleware(async (auth, req) => {
    // Check if the current route is public
    if (!isPublicRoute(req)) {
        // For private routes, ensure user is authenticated
        await auth.protect()
    }
})

/**
 * Next.js middleware configuration
 * 
 * Defines which routes this middleware should run on.
 * This configuration ensures the middleware runs on all routes
 * except Next.js internals and static files.
 */
export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};