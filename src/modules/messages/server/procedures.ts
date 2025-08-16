/**
 * Messages Module - Server Procedures
 * 
 * Handles message operations within projects including retrieval and creation.
 * Messages represent the conversation history between users and the AI code
 * generation system, including prompts, responses, and generated code fragments.
 * 
 * Key Features:
 * - Project-scoped message management
 * - Credit consumption validation for new messages
 * - Integration with Inngest for AI code generation
 * - Support for image attachments in messages
 * - Chronological message ordering
 * - User ownership validation
 * 
 * Security:
 * - Protected procedures requiring authentication
 * - Project ownership validation for all operations
 * - Input sanitization and validation
 */

import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { consumeCredits } from "@/lib/usage";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

/**
 * Message Router
 * 
 * Exposes tRPC procedures for message management within projects.
 * All operations are scoped to the authenticated user's projects.
 */
export const messageRouter = createTRPCRouter({
  /**
   * Get Many Messages
   * 
   * Retrieves all messages for a specific project owned by the authenticated user.
   * Includes associated code fragments and orders messages chronologically.
   * 
   * Features:
   * - Project ownership validation
   * - Includes related fragment data for code generation results
   * - Chronological ordering (oldest first)
   * - User-scoped access control
   * 
   * @input projectId - Target project ID (required)
   * @returns Array of messages with fragments, ordered by creation time
   * @security Validates user owns the target project
   */
  getMany: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, { message: "Project ID is required" }),
      })
    )
    .query(async ({ input, ctx }) => {
      const messages = await prisma.message.findMany({
        where: {
          projectId: input.projectId,
          project: {
            userId: ctx.auth.userId, // Ensure user owns the project
          },
        },
        include: {
          fragment: true, // Include code generation results
        },
        orderBy: {
          createdAt: "asc", // Chronological order for conversation flow
        },
      });
      
      return messages;
    }),

  /**
   * Create Message
   * 
   * Creates a new message within a project and triggers AI code generation.
   * Validates project ownership, consumes user credits, and initiates
   * background processing via Inngest.
   * 
   * Workflow:
   * 1. Validate project exists and user owns it
   * 2. Consume user credits for AI generation
   * 3. Create message record with user prompt
   * 4. Trigger background AI code generation
   * 
   * @input value - User message content (1-10,000 characters)
   * @input projectId - Target project ID (required)
   * @input images - Optional array of image URLs for context
   * @returns Created message object
   * @throws NOT_FOUND if project doesn't exist or user doesn't own it
   * @throws BAD_REQUEST for general errors
   * @throws TOO_MANY_REQUESTS when credits are exhausted
   */
  create: protectedProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: "Prompt is required" })
          .max(10000, { message: "Prompt is too long" }),
        projectId: z.string().min(1, { message: "Project ID is required" }),
        images: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Step 1: Validate project exists and user owns it
      const existingProject = await prisma.project.findUnique({
        where: {
          id: input.projectId,
          userId: ctx.auth.userId,
        },
      });

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // Step 2: Validate user has available credits
      try {
        await consumeCredits();
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Something went wrong",
          });
        } else {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "You have run out of credits",
          });
        }
      }

      // Step 3: Create message record
      const createdMsg = await prisma.message.create({
        data: {
          projectId: existingProject.id,
          content: input.value,
          images: input.images || [],
          role: "USER",
          type: "RESULT",
        },
      });

      // Step 4: Trigger background AI code generation
      await inngest.send({
        name: "code-agent/run",
        data: {
          value: input.value,
          projectId: input.projectId,
          images: input.images,
        },
      });

      return createdMsg;
    }),
});
