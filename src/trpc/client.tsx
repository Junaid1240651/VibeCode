/**
 * tRPC Client Configuration
 * 
 * Sets up the client-side tRPC integration with React Query for the VibeCode
 * application. Provides type-safe API calls, caching, and state management
 * for all server-side procedures.
 * 
 * Key Features:
 * - Type-safe API calls with full TypeScript inference
 * - React Query integration for caching and background updates
 * - HTTP batching for improved performance
 * - SuperJSON transformation for rich data types
 * - SSR/client hydration handling
 * - Singleton pattern for browser query client
 * 
 * Architecture:
 * - TRPCReactProvider wraps the app with necessary providers
 * - Query client is shared between server and client
 * - HTTP batch link optimizes multiple requests
 * - URL resolution handles both development and production
 */

'use client';
// ^-- Ensures this runs on client-side for Provider mounting from server components

import type { QueryClient } from '@tanstack/react-query';
import superjson from 'superjson';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import { useState } from 'react';
import { makeQueryClient } from './query-client';
import type { AppRouter } from './routers/_app';

/**
 * Create tRPC React hooks and provider
 * 
 * Generates type-safe hooks for all API routes:
 * - useTRPC.projects.getMany.useQuery()
 * - useTRPC.messages.create.useMutation()
 * - etc.
 */
export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

/**
 * Browser-side query client singleton
 * Prevents recreation on re-renders and maintains cache consistency
 */
let browserQueryClient: QueryClient;

/**
 * Gets or creates a React Query client
 * 
 * Handles the server/client split for React Query:
 * - Server: Always creates new client for each request
 * - Browser: Uses singleton to maintain cache across navigations
 * 
 * @returns QueryClient instance for the current environment
 */
function getQueryClient() {
    if (typeof window === 'undefined') {
        // Server: always make a new query client for each request
        return makeQueryClient();
    }
    
    // Browser: use singleton pattern to prevent cache loss
    // This prevents React from recreating the client during suspense
    if (!browserQueryClient) {
        browserQueryClient = makeQueryClient();
    }
    
    return browserQueryClient;
}

/**
 * Resolves the tRPC API endpoint URL
 * 
 * Handles both development and production environments:
 * - Development: Relative URL (empty base)
 * - Production: Full URL from environment variable
 * 
 * @returns Complete URL to the tRPC API endpoint
 */
function getUrl() {
    const base = (() => {
        if (typeof window !== 'undefined') {
            // Browser: use relative URL
            return '';
        }
        // Server: use full URL for SSR
        return process.env.NEXT_PUBLIC_APP_URL;
    })();
    
    return `${base}/api/trpc`;
}

/**
 * tRPC React Provider Component
 * 
 * Wraps the application with both React Query and tRPC providers.
 * Configures HTTP batching, data transformation, and client setup.
 * 
 * Features:
 * - HTTP batching for multiple simultaneous requests
 * - SuperJSON transformation for Date/BigInt/etc serialization
 * - Proper SSR/client hydration handling
 * - Query client singleton management
 * 
 * @param props - Component props with children
 * @returns Provider component wrapping children with tRPC and React Query
 */
export function TRPCReactProvider(
    props: Readonly<{
        children: React.ReactNode;
    }>,
) {
    // Get or create query client (handles server/client properly)
    const queryClient = getQueryClient();
    
    // Create tRPC client with batching and transformation
    const [trpcClient] = useState(() =>
        createTRPCClient<AppRouter>({
            links: [
                httpBatchLink({
                    // Enable SuperJSON for rich data types
                    transformer: superjson, 
                    // API endpoint URL
                    url: getUrl(),
                }),
            ],
        }),
    );
    
    return (
        <QueryClientProvider client={queryClient}>
            <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
                {props.children}
            </TRPCProvider>
        </QueryClientProvider>
    );
}