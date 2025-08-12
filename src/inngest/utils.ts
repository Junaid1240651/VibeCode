import { Sandbox } from "@e2b/code-interpreter";
import { AgentResult, Message, TextMessage } from "@inngest/agent-kit";
import { SANDBOX_TIMEOUT } from "./types";

export const getSandBox = async (sandBoxId: string) => {
  const sandBox = await Sandbox.connect(sandBoxId);
  await sandBox.setTimeout(SANDBOX_TIMEOUT);
  return sandBox;
};

export const lastAssistantTextMessageContent = async (result: AgentResult) => {
  const lastAssistantTexMessageIndex = result.output.findLastIndex(
    (message) => message.role === "assistant" && message.type === "text"
  );
  const message = result.output[lastAssistantTexMessageIndex] as
    | TextMessage
    | undefined;

  return message?.content
    ? typeof message.content === "string"
      ? message.content
      : message.content.map((c) => c.text).join("")
    : undefined;
};

export const parseAgentOutput = (value: Message[]) => {
  const output = value[0];
  if (output.type !== "text") {
    return "Fragment";
  }
  if (Array.isArray(output.content)) {
    return output.content.map((txt) => txt).join("");
  } else {
    return output.content;
  }
};
