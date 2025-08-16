/**
 * Projects Module - Server Procedures
 * 
 * Defines tRPC procedures for project management operations including
 * creation, retrieval, and interaction with the AI code generation system.
 * 
 * Key Features:
 * - Project CRUD operations with user ownership validation
 * - AI-powered project name generation
 * - Credit consumption and rate limiting
 * - Integration with Inngest for background code generation
 * - Image support for visual project context
 * - Type-safe input validation with Zod schemas
 * 
 * Security:
 * - All procedures are protected (require authentication)
 * - User-scoped data access (users can only access their own projects)
 * - Input validation and sanitization
 * - Error handling with appropriate HTTP status codes
 */

import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { generateSlug } from "random-word-slugs";
import { TRPCError } from "@trpc/server";
import { consumeCredits } from "@/lib/usage";
import { generateProjectName } from "@/lib/project-name-generator";

/**
 * Project Router
 * 
 * Exposes tRPC procedures for project management operations.
 * All procedures require user authentication and operate within
 * the user's project scope.
 */
export const projectRouter = createTRPCRouter({
  /**
   * Get Single Project
   * 
   * Retrieves a specific project by ID for the authenticated user.
   * Validates ownership to ensure users can only access their own projects.
   * 
   * @input id - Project ID string (required, minimum 1 character)
   * @returns Project object if found and owned by user
   * @throws NOT_FOUND if project doesn't exist or user doesn't own it
   */
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: "Project ID is required" }),
      })
    )
    .query(async ({ input, ctx }) => {
      const existingProject = await prisma.project.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.userId, // Ensure user owns the project
        },
      });
      
      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }
      
      return existingProject;
    }),

  /**
   * Get Many Projects
   * 
   * Retrieves all projects for the authenticated user.
   * Results are ordered by creation date (newest first).
   * 
   * @returns Array of user's projects sorted by creation date
   */
  getMany: protectedProcedure.query(async ({ ctx }) => {
    const projects = await prisma.project.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return projects;
  }),

  /**
   * Create Project
   * 
   * Creates a new project with AI code generation workflow.
   * Handles credit consumption, project name generation, and
   * initiates background code generation via Inngest.
   * 
   * Workflow:
   * 1. Validate user has available credits
   * 2. Generate intelligent project name from prompt
   * 3. Create project record with initial user message
   * 4. Trigger background AI code generation
   * 
   * @input value - User prompt (1-10,000 characters)
   * @input images - Optional array of image URLs for context
   * @returns Created project object
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
        images: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Step 1: Validate user has available credits
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

      // Step 2: Generate intelligent project name from user prompt
      let projectName: string;
      try {
        projectName = await generateProjectName(input.value);
      } catch {
        // Fallback to random slug if AI generation fails
        projectName = generateSlug(2, {
          format: "kebab",
        });
      }

      // Step 3: Create project with initial user message
      const createProject = await prisma.project.create({
        data: {
          userId: ctx.auth.userId,
          name: projectName,
          messages: {
            create: {
              content: input.value,
              images: input.images || [],
              role: "USER",
              type: "RESULT",
            },
          },
        },
      });

      // Step 4: Trigger background AI code generation
      await inngest.send({
        name: "code-agent/run",
        data: {
          value: input.value,
          projectId: createProject.id,
          images: input.images,
        },
      });

      return createProject;
    }),
});
