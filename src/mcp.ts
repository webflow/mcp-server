import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebflowClient } from "webflow-api";
import { postChat } from "./tools/aiChat";
import { FeatureFlags } from "./tools/featureFlags";
import { z } from "zod";
import {
  registerCmsTools,
  registerPagesTools,
  registerScriptsTools,
  registerSiteTools,
} from "./tools";

const packageJson = require("../package.json") as any;

// Create an MCP server
export function createMcpServer(featureFlags: FeatureFlags) {
  return new McpServer({
    name: packageJson.name,
    version: packageJson.version,
  },
{
  instructions: `These tools give you access to the Webflow's Data API.${
    featureFlags.enableWebflowAiChat
      ? `If you are ever unsure about anything Webflow API-related, use the "ask_webflow_ai" tool.`
      : ""
  }`,
});
}

// Common request options, including User-Agent header
export const requestOptions = {
  headers: {
    "User-Agent": `Webflow MCP Server/${packageJson.version}`,
  },
};

// Register tools
export function registerTools(
  server: McpServer,
  getClient: () => WebflowClient,
  featureFlags: FeatureFlags
) {

 registerCmsTools(server, getClient);
 registerPagesTools(server, getClient);
 registerScriptsTools(server, getClient);
 registerSiteTools(server, getClient);
 if (featureFlags.enableWebflowAiChat) {
  server.tool(
    "ask_webflow_ai",
    "Ask Webflow AI about anything related to Webflow API.",
    { message: z.string() },
    async ({ message }) => {
      const result = await postChat(message);
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );
}
}
