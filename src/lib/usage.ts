import { auth } from "@clerk/nextjs/server";
import { prisma } from "./db";
import { RateLimiterPrisma } from "rate-limiter-flexible";

const FREE_POINT = 1;
const PRO_POINTS = 100  
const FREE_DURATION = 30 * 24 * 60 * 60; // 30days
const GENERATION_COST = 1;

export async function getUsageTracker() {
    const { has } = await auth();
    const hasProAccess = has({ plan: 'pro' });
    const usageTracker = new RateLimiterPrisma({
        storeClient: prisma,
        tableName: 'Usage',
        points: hasProAccess ? PRO_POINTS : FREE_POINT,
        duration: FREE_DURATION
    });
    return usageTracker;
}

export async function consumeCredits() {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not authenticate");
    }
    const usageTracker = await getUsageTracker();
    const result = await usageTracker.consume(userId, GENERATION_COST);
    return result;
}

export async function getUsageStatus() {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not authenticate");
    }

    const usageTracker = await getUsageTracker();
    const result = await usageTracker.get(userId);
    return result;
}

