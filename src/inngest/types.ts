/**
 * Inngest Types and Constants
 * 
 * Defines type definitions and configuration constants for the Inngest
 * AI code generation workflow system.
 * 
 * Key Features:
 * - Timeout configurations for long-running operations
 * - Type safety for event data structures
 * - Constants for workflow management
 * - Error handling configurations
 */

/**
 * Sandbox Execution Timeout
 * 
 * Maximum time allowed for AI code generation and sandbox execution.
 * Set to 30 minutes (1800 seconds) to accommodate complex code generation
 * tasks including:
 * - Large project scaffolding
 * - Multiple file generation
 * - Dependency resolution
 * - Build process execution
 * - Error recovery and retries
 * 
 * Calculation: 60,000ms * 3 * 10 = 1,800,000ms = 30 minutes
 */
export const SANDBOX_TIMEOUT = 60_000 * 3 * 10; // 30 minutes in ms