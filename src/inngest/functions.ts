import { inngest } from "./client";
import { createAgent, gemini, createTool, createNetwork } from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter"
import { getSandBox, lastAssistantTexMessageContent } from "./utils";
import { PROMPT } from "@/prompt";
import { z } from "zod";

export const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: "test/hello.world" },
    async ({ event, step }) => {
        const sandBoxId = await step.run("get-sandbox-id", async () => {
            const sandbox = await Sandbox.create("dnym8armtb5iub9mmtbp");
            return sandbox.sandboxId;
        });
        // Create a new agent with a system prompt (you can add optional tools, too)
        const codeAgent = createAgent({
            name: "code-agent",
            description: 'An Expert coding agent',
            system: PROMPT,
            model: gemini({ model: "gemini-2.0-flash-lite" }),
            tools: [
                createTool({
                    name: 'terminal',
                    description: 'Execute a command in the terminal',
                    parameters: z.object({
                        command: z.string().describe("Command to execute (e.g., 'npm install package-name --yes')")
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
                                    }
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
                    name: 'createOrUpdateFiles',
                    description: 'Create or update files in the sandbox',
                    parameters: z.object({
                        files: z.array(z.object({
                            path: z.string().describe("Relative file path (e.g., 'app/page.tsx')"),
                            content: z.string().describe("Complete file content")
                        }).describe("File to create or update"))
                    }),
                    handler: async ({ files }, { step, network }) => {
                        const newFiles = await step?.run("createOrUpdateFiles", async () => {
                            try {
                                const updatedFiles = network.state.data.files || {};
                                const sandBox = await getSandBox(sandBoxId);
                                for (const file of files) {
                                    await sandBox.files.write(file.path, file.content)
                                    updatedFiles[file.path] = file.content;
                                };
                                return updatedFiles;
                            } catch (error) {
                                throw new Error(`Failed to create/update files: ${error}`);
                            }
                        });
                        if (typeof newFiles === "object") {
                            network.state.data.files = newFiles;
                        }
                        return "Files created/updated successfully";
                    },
                }),
                createTool({
                    name: 'readFiles',
                    description: 'Read files from the sandbox',
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
                    const lastAssistantTextMessage = await lastAssistantTexMessageContent(result);
                    if (lastAssistantTextMessage && network) {
                        if (lastAssistantTextMessage.includes("<task_summary>")) {
                            network.state.data.summary = lastAssistantTextMessage;
                        }
                    }
                    return result;
                }
            }
        });
        const network = createNetwork({
            name: 'coding-agent-network',
            agents: [codeAgent],
            maxIter: 15,
            router: async ({ network }) => {
                const summary = network.state.data.summary;
                if (summary) {
                    return;
                }
                return codeAgent;
            }
        });
        const result = await network.run(event.data.value)

        const sandBoxUrl = await step.run("get-sandbox-url", async () => {
            const sandbox = await getSandBox(sandBoxId)
            const host = sandbox.getHost(3000);
            return `https://${host}`
        });

        return {
            url: sandBoxUrl,
            title: "Fragment",
            summary: result.state.data.summary,
            files: result.state.data.files
        }
    },
);