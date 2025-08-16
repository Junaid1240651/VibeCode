/**
 * Usage Module - Server Procedures
 * 
 * Provides tRPC procedures for monitoring user credit usage and consumption status.
 * This module exposes endpoints to check remaining credits and usage statistics
 * for the credit-based AI code generation system.
 * 
 * Key Features:
 * - Real-time usage status monitoring
 * - Credit balance checking
 * - Error handling with fallback responses
 * - Protected access requiring authentication
 * 
 * Integration:
 * - Connects with usage tracking system in @/lib/usage
 * - Used by UI components to display credit status
 * - Supports billing and rate limiting decisions
 */

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { getUsageStatus } from "@/lib/usage";

/**
 * Usage Router
 * 
 * Exposes tRPC procedures for usage monitoring and credit management.
 * Provides real-time access to user's credit status and consumption data.
 */
export const usageRouter = createTRPCRouter({
    /**
     * Get Usage Status
     * 
     * Retrieves the current usage status for the authenticated user,
     * including credit balance, consumption history, and rate limit information.
     * 
     * Features:
     * - Returns detailed credit usage information
     * - Handles errors gracefully with null fallback
     * - Real-time status for UI updates
     * - Supports billing and limit enforcement
     * 
     * @returns Usage status object with credit information, or null on error
     * @security Protected procedure requiring valid authentication
     * 
     * @example
     * // Usage in React component
     * const { data: usage } = trpc.usage.status.useQuery();
     * if (usage) {
     *   console.log(`Credits remaining: ${usage.creditsRemaining}`);
     * }
     */
    status: protectedProcedure.query(async () => {
        try {
            const result = await getUsageStatus();
            return result;
        } catch {
            // Return null on any error to allow graceful UI handling
            return null;
        }
    })
})