import { inngest } from "./client";
import {
  createAgent,
  gemini,
  openai,
  createTool,
  createNetwork,
  Tool,
  Message,
  createState,
} from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import {
  getSandBox,
  lastAssistantTextMessageContent,
  parseAgentOutput,
} from "./utils";
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/prompt";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { SANDBOX_TIMEOUT } from "./types";

// Common function to get existing files from the latest fragment
async function getExistingFiles(
  projectId: string
): Promise<{ [path: string]: string }> {
  const existingFragment = await prisma.fragment.findFirst({
    where: {
      message: {
        projectId: projectId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return existingFragment?.files
    ? typeof existingFragment.files === "object"
      ? (existingFragment.files as { [path: string]: string })
      : {}
    : {};
}

interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT!;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? "2024-04-01-preview";

// Function to sanitize content for PostgreSQL
function sanitizeContent(content: string): string {
  if (!content) return content;
  // Remove null bytes and other problematic Unicode characters
  return content
    .replace(/\u0000/g, "") // Remove null bytes
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "") // Remove other control characters
    .trim();
}

export const codeAgentFunction = inngest.createFunction(
  { id: "codeAgent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const sandBoxId = await step.run("get-sandbox-id", async () => {
      // Always create a new sandbox
      const sandbox = await Sandbox.create("dnym8armtb5iub9mmtbp");
      await sandbox.setTimeout(SANDBOX_TIMEOUT);

      // Get existing files using the common function
      const existingFiles = await getExistingFiles(event.data.projectId);

      // Copy existing files to the new sandbox
      if (Object.keys(existingFiles).length > 0) {
        
        for (const [filePath, fileContent] of Object.entries(existingFiles)) {
          try {
            await sandbox.files.write(filePath, fileContent);
          } catch (error) {
            console.error(`Failed to copy file ${filePath}:`, error);
          }
        }
      }
      return sandbox.sandboxId;
    });

    const previousMessage = await step.run(
      "get-previous-messages",
      async () => {
        const formattedMessages: Message[] = [];
        const messages = await prisma.message.findMany({
          where: {
            projectId: event.data.projectId,
          },
          orderBy: {
            createdAt: "desc",
          },
        //   take: 10,
        //for context msg length
        });
        for (const message of messages) {
          formattedMessages.push({
            type: "text",
            role: message.role === "ASSISTANT" ? "assistant" : "user",
            content: message.content,
          });
        }
        return formattedMessages.reverse();
      }
    );

    const existingFiles = await step.run("get-existing-files", async () => {
      // Use the common function to get existing files
      return await getExistingFiles(event.data.projectId);
    });

    const state = createState<AgentState>(
      {
        summary: "",
        files: existingFiles,
      },
      {
        messages: previousMessage,
      }
    );

    // Create a new agent with a system prompt (you can add optional tools, too)
    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      description: "An Expert coding agent",
      system: PROMPT,
      model: (() => {
        // Create a custom Azure OpenAI adapter
        const baseModel = openai({
          model: "gpt-4.1",
          apiKey: process.env.AZURE_OPENAI_API_KEY!,
          baseUrl: "https://api.openai.com/v1/", // temporary, will be overridden
        });

        // Override the URL and headers for Azure
        return {
          ...baseModel,
          url: `${endpoint}openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
          headers: {
            "api-key": process.env.AZURE_OPENAI_API_KEY!,
            "Content-Type": "application/json",
          },
          authKey: process.env.AZURE_OPENAI_API_KEY!,
        };
      })(),

      tools: [
        createTool({
          name: "terminal",
          description: "Execute a command in the terminal",
          parameters: z.object({
            command: z
              .string()
              .describe(
                "Command to execute (e.g., 'npm install package-name --yes')"
              ),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };
              try {
                const sandbox = await getSandBox(sandBoxId);
                const result = await sandbox.commands.run(command, {
                  onStdout(data: string) {
                    buffers.stdout += data.toString();
                  },
                  onStderr(data: string) {
                    buffers.stderr += data.toString();
                  },
                });
                return result.stdout || buffers.stdout;
              } catch (e) {
                const errorMsg = `Command failed: ${e}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
                console.error(errorMsg);
                throw new Error(errorMsg);
              }
            });
          },
        }),
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox",
          parameters: z.object({
            files: z.array(
              z
                .object({
                  path: z
                    .string()
                    .describe("Relative file path (e.g., 'app/page.tsx')"),
                  content: z.string().describe("Complete file content"),
                })
                .describe("File to create or update")
            ),
          }),
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>
          ) => {
            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandBox = await getSandBox(sandBoxId);
                  for (const file of files) {
                    await sandBox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }
                  return updatedFiles;
                } catch (error) {
                  throw new Error(`Failed to create/update files: ${error}`);
                }
              }
            );
            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
            return "Files created/updated successfully";
          },
        }),
        createTool({
          name: "readFiles",
          description: "Read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string().describe("File path to read")),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandBox(sandBoxId);
                const content = [];
                for (const file of files) {
                  const fileContent = await sandbox.files.read(file);
                  content.push({ path: file, content: fileContent });
                }
                return JSON.stringify(content);
              } catch (error) {
                throw new Error(`Failed to read files: ${error}`);
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantTextMessage =
            await lastAssistantTextMessageContent(result);
          if (lastAssistantTextMessage && network) {
            if (lastAssistantTextMessage.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantTextMessage;
            }
          }
          return result;
        },
      },
    });
    const network = createNetwork<AgentState>({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      defaultState: state,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary) {
          return;
        }
        return codeAgent;
      },
    });
    // Prepare the input with text and images (now using URLs instead of base64)
    const userInput =
      event.data.images && event.data.images.length > 0
        ? [
            { type: "text", content: event.data.value },
            ...event.data.images.map((imageUrl: string) => ({
              type: "image_url",
              image_url: {
                url: imageUrl, // Now using Azure Blob Storage URLs
              },
            })),
          ]
        : event.data.value;

    const result = await network.run(userInput, { state });
    const fragmentTitleGenerator = createAgent({
      name: "fragment-title-genertator",
      description: "A fragment title generator",
      model: gemini({ model: "gemini-2.0-flash-lite" }),
      system: FRAGMENT_TITLE_PROMPT,
    });
    const responseGenerator = createAgent({
      name: "response-genertator",
      description: "A response generator",
      model: gemini({ model: "gemini-2.0-flash-lite" }),
      system: RESPONSE_PROMPT,
    });

    const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(
      result.state.data.summary
    );
    const { output: responseOutput } = await responseGenerator.run(
      result.state.data.summary
    );

    const hasError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;
    const sandBoxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandBox(sandBoxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    await step.run("save-result", async () => {
      if (hasError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something went wrong. Please try again.",
            role: "ASSISTANT",
            type: "ERROR",
          },
        });
      }
      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: sanitizeContent(parseAgentOutput(responseOutput)),
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              sandboxURL: sandBoxUrl,
              title: sanitizeContent(parseAgentOutput(fragmentTitleOutput)),
              files: Object.fromEntries(
                Object.entries(result.state.data.files || {}).map(
                  ([path, content]) => [path, sanitizeContent(content)]
                )
              ),
            },
          },
        },
      });
    });
    return {
      url: sandBoxUrl,
      title: "Fragment",
      summary: result.state.data.summary,
      files: result.state.data.files,
    };
  }
);
