/**
 * Inngest Utility Functions
 * 
 * Provides utility functions for managing E2B sandboxes and processing
 * AI agent outputs in the VibeCode Inngest workflow system.
 * 
 * Key Features:
 * - E2B sandbox connection and timeout management
 * - AI agent message parsing and content extraction
 * - Text content normalization from complex message structures
 * - Error handling for sandbox operations
 * 
 * Integration:
 * - Works with @inngest/agent-kit for AI interactions
 * - Manages @e2b/code-interpreter sandboxes for code execution
 * - Processes various message types and content formats
 */

import { Sandbox } from "@e2b/code-interpreter";
import { AgentResult, Message, TextMessage } from "@inngest/agent-kit";
import { SANDBOX_TIMEOUT } from "./types";

/**
 * Connects to and configures an E2B sandbox
 * 
 * Establishes connection to an existing E2B sandbox instance and sets
 * the execution timeout for code generation operations.
 * 
 * Features:
 * - Connects to existing sandbox by ID
 * - Sets timeout for long-running operations
 * - Ensures sandbox is ready for code execution
 * 
 * @param sandBoxId - The unique identifier of the E2B sandbox to connect to
 * @returns Configured Sandbox instance ready for code execution
 * 
 * @example
 * const sandbox = await getSandBox("sandbox_123");
 * await sandbox.files.write("app.py", pythonCode);
 * await sandbox.commands.run("python app.py");
 */
export const getSandBox = async (sandBoxId: string) => {
  const sandBox = await Sandbox.connect(sandBoxId);
  await sandBox.setTimeout(SANDBOX_TIMEOUT);
  return sandBox;
};

/**
 * Extracts the last assistant text message content from agent results
 * 
 * Parses AI agent output to find the most recent assistant message
 * and extracts its text content, handling both string and array formats.
 * 
 * Features:
 * - Finds last assistant message in conversation
 * - Handles both string and array content formats
 * - Returns undefined if no assistant text message found
 * - Supports complex content structures
 * 
 * @param result - The AgentResult containing conversation output
 * @returns The text content of the last assistant message, or undefined
 * 
 * @example
 * const content = await lastAssistantTextMessageContent(agentResult);
 * if (content) {
 *   console.log("AI response:", content);
 * }
 */
export const lastAssistantTextMessageContent = async (result: AgentResult) => {
  // Find the last assistant text message in the output
  const lastAssistantTexMessageIndex = result.output.findLastIndex(
    (message) => message.role === "assistant" && message.type === "text"
  );
  
  const message = result.output[lastAssistantTexMessageIndex] as
    | TextMessage
    | undefined;

  // Extract content handling both string and array formats
  return message?.content
    ? typeof message.content === "string"
      ? message.content
      : message.content.map((c) => c.text).join("")
    : undefined;
};

/**
 * Parses agent output messages into readable text
 * 
 * Converts agent message output into a single text string,
 * handling different message types and content structures.
 * 
 * Features:
 * - Handles text message types
 * - Processes array-based content structures
 * - Provides fallback for non-text messages
 * - Joins multiple content pieces into single string
 * 
 * @param value - Array of messages from agent output
 * @returns Parsed text content as string
 * 
 * @example
 * const messages = agentResult.output;
 * const text = parseAgentOutput(messages);
 * console.log("Parsed output:", text);
 */
export const parseAgentOutput = (value: Message[]) => {
  const output = value[0];
  
  // Handle non-text message types
  if (output.type !== "text") {
    return "Fragment";
  }
  
  // Process content based on structure
  if (Array.isArray(output.content)) {
    return output.content.map((txt) => txt).join("");
  } else {
    return output.content;
  }
};
