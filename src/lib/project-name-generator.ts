import { createAgent, gemini } from "@inngest/agent-kit";
import { PROJECT_NAME_PROMPT } from "@/prompt";

export async function generateProjectName(userPrompt: string): Promise<string> {
  try {
    const projectNameGenerator = createAgent({
      name: "project-name-generator",
      description: "A project name generator based on user prompts",
      model: gemini({ model: "gemini-2.0-flash-lite" }),
      system: PROJECT_NAME_PROMPT,
    });

    const { output } = await projectNameGenerator.run(userPrompt);

    // Extract text content from the message array
    const outputText = output
      .filter(msg => msg.type === 'text' && msg.role === 'assistant')
      .map(msg => {
        // Type guard to ensure we have a text message with content
        if (msg.type === 'text' && 'content' in msg) {
          return msg.content;
        }
        return '';
      })
      .join(' ')
      .trim();

    // Basic cleanup - the AI should already return the correct format
    const projectName = outputText.trim();

    // Ensure it's not empty and has a reasonable length
    if (!projectName || projectName.length < 2) {
      throw new Error('Generated project name is too short');
    }

    // Limit length to prevent overly long names
    return projectName.length > 50 ? projectName.substring(0, 47).trim() + '...' : projectName;

  } catch (error) {
    console.error('Failed to generate project name:', error);
    // Simple fallback if AI generation fails
    return 'New Project';
  }
}