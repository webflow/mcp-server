import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { randomUUID } from "crypto";
import { z } from "zod";

const BASE_URL = "https://developers.webflow.com/";
const X_FERN_HOST = "developers.webflow.com";

export function registerAiChatTools(server: McpServer) {
  server.registerTool(
    "ask_webflow_ai",
    {
      description: "Ask Webflow AI about anything related to Webflow API.",
      title: "Ask Webflow AI",
      annotations: {
        openWorldHint: true,
      },
      inputSchema: {
        message: z.string().describe("The message to ask Webflow AI about."),
      },
    },
    async ({ message }) => {
      const result = await postChat(message);
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );
}

async function postChat(message: string) {
  const response = await fetch(`${BASE_URL}/api/fern-docs/search/v2/chat`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-fern-host": X_FERN_HOST,
    },
    body: JSON.stringify({
      messages: [{ role: "user", parts: [{ type: "text", text: message }] }],
      conversationId: randomUUID(),
      url: BASE_URL,
      source: "mcp",
    }),
  });

  const result = await streamToString(response);
  return result;
}

async function streamToString(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("!reader");
  }

  let result = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // Convert the Uint8Array to a string and append
    result += new TextDecoder().decode(value);
  }

  return result;
}
