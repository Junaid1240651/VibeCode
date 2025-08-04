import { inngest } from "./client";
import {openai, createAgent,gemini } from "@inngest/agent-kit";

export const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: "test/hello.world" },
    async ({ event }) => {
        // Create a new agent with a system prompt (you can add optional tools, too)
        const writer = createAgent({
            name: "summerizer",
            system: "write an intro",
            model: gemini({ model: "gemini-2.0-flash-lite" }),
        });
        const { output } = await writer.run(
            `summerizer the following text and write an intro : ${event.data.value}`,
        );
        console.log(output);
        
        return { message: output }
    },
);