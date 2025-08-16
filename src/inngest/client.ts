/**
 * Inngest Client Configuration
 * 
 * Sets up the Inngest client for background job processing and event-driven
 * workflows in the VibeCode application. Inngest handles the AI code generation
 * pipeline, running complex operations asynchronously without blocking the UI.
 * 
 * Key Features:
 * - Event-driven architecture for scalable background processing
 * - Automatic retries and error handling for failed jobs
 * - Built-in monitoring and observability
 * - Type-safe event definitions and handlers
 * - Reliable execution for AI code generation workflows
 * 
 * Usage:
 * - Triggered when users create projects or send messages
 * - Orchestrates AI agents for code generation
 * - Handles long-running operations like file processing
 * - Manages workflow state across multiple steps
 */

import { Inngest } from "inngest";

/**
 * Inngest Client Instance
 * 
 * Creates the main Inngest client for sending events and defining functions.
 * The client ID "VibeCode" identifies this application in the Inngest dashboard
 * and is used for routing events to the correct handlers.
 * 
 * Event Types Handled:
 * - "code-agent/run" - Triggers AI code generation workflow
 * - Message processing and response generation
 * - File creation and project setup
 * - Error handling and retry logic
 * 
 * @example
 * // Trigger code generation
 * await inngest.send({
 *   name: "code-agent/run",
 *   data: {
 *     value: userPrompt,
 *     projectId: project.id,
 *     images: imageUrls
 *   }
 * });
 */
export const inngest = new Inngest({ id: "VibeCode" });