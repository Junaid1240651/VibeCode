/**
 * Usage Tracking and Credit System
 * 
 * This file manages the credit-based usage tracking system for the application.
 * It implements rate limiting and tracks user consumption of AI generation credits.
 * 
 * Key Features:
 * - Free tier: 1 credit every 30 days
 * - Pro tier: 100 credits every 30 days
 * - Rate limiting with database storage
 * - Credit consumption tracking
 * - Usage status monitoring
 */

import { auth } from "@clerk/nextjs/server";
import { prisma } from "./db";
import { RateLimiterPrisma } from "rate-limiter-flexible";

// Credit system configuration
const FREE_POINT = 1;                           // Free tier credits
const PRO_POINTS = 100;                         // Pro tier credits  
const FREE_DURATION = 30 * 24 * 60 * 60;       // 30 days in seconds
const GENERATION_COST = 1;                      // Cost per AI generation

/**
 * Get Usage Tracker Instance
 * 
 * Creates a rate limiter instance configured based on user's subscription tier.
 * Uses Prisma database for persistent storage of usage data.
 * 
 * @returns Configured RateLimiterPrisma instance
 */
export async function getUsageTracker() {
    const { has } = await auth();
    
    // Check if user has pro access
    const hasProAccess = has({ plan: 'pro' });
    
    // Create rate limiter with tier-specific configuration
    const usageTracker = new RateLimiterPrisma({
        storeClient: prisma,                    // Use Prisma for storage
        tableName: 'Usage',                     // Database table name
        points: hasProAccess ? PRO_POINTS : FREE_POINT,  // Credits based on tier
        duration: FREE_DURATION                 // Reset period (30 days)
    });
    
    return usageTracker;
}

/**
 * Consume Credits
 * 
 * Attempts to consume credits for an AI generation request.
 * Throws an error if user has insufficient credits.
 * 
 * @throws Error if user is not authenticated
 * @throws Error if user has insufficient credits
 * @returns Rate limiter result with remaining credits
 */
export async function consumeCredits() {
    const { userId } = await auth();
    
    // Ensure user is authenticated
    if (!userId) {
        throw new Error("User not authenticated");
    }
    
    // Get configured usage tracker for user's tier
    const usageTracker = await getUsageTracker();
    
    // Attempt to consume credits for the generation
    const result = await usageTracker.consume(userId, GENERATION_COST);
    
    return result;
}

/**
 * Get Usage Status
 * 
 * Retrieves current usage information for the authenticated user.
 * Shows remaining credits, reset time, and usage statistics.
 * 
 * @throws Error if user is not authenticated
 * @returns Usage statistics object with remaining points and timing
 */
export async function getUsageStatus() {
    const { userId } = await auth();
    
    // Ensure user is authenticated
    if (!userId) {
        throw new Error("User not authenticated");
    }

    // Get configured usage tracker for user's tier
    const usageTracker = await getUsageTracker();
    
    // Retrieve current usage data
    const result = await usageTracker.get(userId);
    
    return result;
}

