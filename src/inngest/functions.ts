import { inngest } from "./client";
import {openai, createAgent,gemini } from "@inngest/agent-kit";
import {Sandbox} from "@e2b/code-interpreter"
import { getSandBox } from "./utils";
export const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: "test/hello.world" },
    async ({ event, step }) => {
        const sandBoxId = await step.run("create sandbox", async () => {
            const sandbox = await Sandbox.create("hnt99hojqohbhbj9jjck");
            return sandbox.sandboxId;
        });
        // Create a new agent with a system prompt (you can add optional tools, too)
        const writer = createAgent({
            name: "code-agent",
            system: "You are an expert next.js developer. You write readable, maintainable code. You write simple Next.js & React snippets.",
            model: gemini({ model: "gemini-2.0-flash-lite" }),
        });
        const { output } = await writer.run(
            `Write the following snippet in Next.js: ${event.data.value}`,
        );

        const sandBoxUrl = await step.run("get-sandbox-url", async () => {
            const sandbox = await getSandBox(sandBoxId)
            const host = sandbox.getHost(3000);
            return `https://${host}`
        });
        
        return { output, sandBoxUrl }
    },
);